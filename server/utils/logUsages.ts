import type { H3Event } from 'h3'
import { eventLogTable } from '~~/db/schema.js'
import { IPEBeaconPayload } from '~~/shared/types'

export async function logUsages(
  event: H3Event,
  data: {
    siteId: number
    userId: number
    usages: IPEBeaconPayload['usages'][number][]
    coreVersion?: string
  }
) {
  const { siteId, userId, usages, coreVersion } = data
  if (!usages.length) return

  const drizzle = useDrizzle(event)

  // 1️⃣ 批量插入 event_log
  const events = usages
    .map((u) => ({
      siteId,
      userId,
      feature: u.feature,
      subtype: u.subtype,
      pageName: u.page,
      coreVersion,
      createdAt: Math.floor(u.ts / 1000), // 转为 UTC 秒
    }))
    .sort((a, b) => a.createdAt - b.createdAt) // 按时间戳排序
  const eventsResult = await drizzle.insert(eventLogTable).values(events).run()

  console.info(eventsResult)
  return eventsResult
}
