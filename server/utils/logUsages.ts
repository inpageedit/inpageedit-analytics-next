import type { H3Event } from 'h3'
import { sql } from 'drizzle-orm'
import type { D1PreparedStatement } from '@cloudflare/workers-types'
import { eventLogTable, usageRollupTable } from '~~/db/schema.js'

type UsageInput = {
  ts: number // 毫秒时间戳
  feature: string
  subtype?: string
  page?: string
}

/** 按 UTC 对齐的时间桶（秒） */
function calcUtcBuckets(tsSec: number) {
  const date = new Date(tsSec * 1000)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()

  const yearStart = Date.UTC(year, 0, 1, 0, 0, 0) / 1000
  const monthStart = Date.UTC(year, month, 1, 0, 0, 0) / 1000
  const dayStart = Date.UTC(year, month, day, 0, 0, 0) / 1000

  return {
    all: 0,
    year: Math.floor(yearStart),
    month: Math.floor(monthStart),
    day: Math.floor(dayStart),
  }
}

/** 维度组合（汇总哨兵值） */
function dimCombos(siteId: number, userId: number, feature: string) {
  const f = feature ?? ''
  return [
    [0, 0, ''],
    [siteId, 0, ''],
    [0, userId, ''],
    [0, 0, f],
    [siteId, userId, ''],
    [siteId, 0, f],
    [0, userId, f],
    // [siteId, userId, f], // 可选三维组合
  ] as Array<[number, number, string]>
}

export async function logUsages(
  event: H3Event,
  siteId: number,
  userId: number,
  usages: UsageInput[]
) {
  if (!usages.length) return

  const D1 = useD1(event)
  const drizzle = useDrizzle(event)

  // 1️⃣ 批量插入 event_log
  const events = usages.map((u) => ({
    siteId,
    userId,
    feature: u.feature,
    subtype: u.subtype,
    page: u.page,
    eventAt: Math.floor(u.ts / 1000), // 转为 UTC 秒
  }))
  const result = await drizzle.insert(eventLogTable).values(events).run()

  // 2️⃣ 构造 rollup UPSERT - 使用 SQL 语句
  const batchOps: D1PreparedStatement[] = []

  for (const ev of events) {
    const buckets = calcUtcBuckets(ev.eventAt)
    const combos = dimCombos(siteId, userId, ev.feature)

    for (const [periodKind, periodStart] of Object.entries(buckets)) {
      for (const [s, u, f] of combos) {
        const insertQuery = drizzle
          .insert(usageRollupTable)
          .values({
            periodKind,
            periodStart,
            siteId: s,
            userId: u,
            feature: f,
            count: 1,
          })
          .onConflictDoUpdate({
            target: [
              usageRollupTable.periodKind,
              usageRollupTable.periodStart,
              usageRollupTable.siteId,
              usageRollupTable.userId,
              usageRollupTable.feature,
            ],
            set: {
              count: sql`${usageRollupTable.count} + 1`,
            },
          })

        const compiled = insertQuery.toSQL()
        const stmt = D1.prepare(compiled.sql).bind(...(compiled.params ?? []))
        batchOps.push(stmt)
      }
    }
  }

  // 3️⃣ 使用 D1 的 batch API 批量执行
  await D1.batch(batchOps)

  return result
}
