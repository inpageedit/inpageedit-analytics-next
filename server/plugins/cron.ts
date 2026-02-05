import { drizzle } from 'drizzle-orm/d1'
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { D1Database, KVNamespace } from '@cloudflare/workers-types'
import { eventLogTable, wikiSiteTable, wikiUserTable } from '~~/db/schema.js'
import {
  PRECALC_KEY_PREFIX,
  getNowSeconds,
  ONE_DAY,
} from '~~/server/utils/cache.js'

// Pre-calculation windows
const PRECALC_WINDOWS = [
  { name: 'last_1d', days: 1 },
  { name: 'last_7d', days: 7 },
  { name: 'last_30d', days: 30 },
]

const TOP_N = 50 // Number of top items to pre-calculate

interface CloudflareEnv {
  D1: D1Database
  KV: KVNamespace
}

export default nitroPlugin((app) => {
  app.hooks.hook(
    'cloudflare:scheduled',
    async ({ context, controller, env }) => {
      const cfEnv = env as CloudflareEnv
      const d1 = cfEnv.D1
      const kv = cfEnv.KV

      if (!d1 || !kv) {
        console.error('[Cron] Missing D1 or KV binding')
        return
      }

      const drizzle_ = drizzle(d1, { casing: 'snake_case' })
      const now = getNowSeconds()

      try {
        // Pre-calculate leaderboard data for common windows
        await preCalculateLeaderboards(drizzle_, kv, now)

        // Pre-calculate total stats for common windows
        await preCalculateTotals(drizzle_, kv, now)

        console.info('[Cron] Pre-calculation completed successfully')
      } catch (error) {
        console.error('[Cron] Pre-calculation failed:', error)
      }
    }
  )
})

async function preCalculateLeaderboards(
  drizzle_: any,
  kv: KVNamespace,
  now: number
) {
  for (const window of PRECALC_WINDOWS) {
    const start = now - window.days * ONE_DAY
    const end = now

    // Site leaderboard
    const siteKey = `${PRECALC_KEY_PREFIX}:leaderboard:site:${window.name}`
    const siteRows = await drizzle_
      .select({
        siteId: eventLogTable.siteId,
        count: count(),
        site: wikiSiteTable,
      })
      .from(eventLogTable)
      .leftJoin(wikiSiteTable, eq(eventLogTable.siteId, wikiSiteTable.id))
      .where(
        and(
          gte(eventLogTable.createdAt, start),
          lte(eventLogTable.createdAt, end)
        )
      )
      .groupBy(
        eventLogTable.siteId,
        wikiSiteTable.id,
        wikiSiteTable.name,
        wikiSiteTable.apiUrl
      )
      .orderBy(desc(sql`count(*)`))
      .limit(TOP_N)
      .all()

    await kv.put(
      siteKey,
      JSON.stringify({
        data: siteRows,
        window: window.name,
        start,
        end,
        updatedAt: now,
      }),
      { expirationTtl: 2 * ONE_DAY }
    )

    // User leaderboard (global)
    const userKey = `${PRECALC_KEY_PREFIX}:leaderboard:user:${window.name}`
    const userRows = await drizzle_
      .select({
        userId: eventLogTable.userId,
        count: count(),
        user: wikiUserTable,
        site: wikiSiteTable,
      })
      .from(eventLogTable)
      .leftJoin(wikiUserTable, eq(eventLogTable.userId, wikiUserTable.id))
      .leftJoin(wikiSiteTable, eq(wikiUserTable.siteId, wikiSiteTable.id))
      .where(
        and(
          gte(eventLogTable.createdAt, start),
          lte(eventLogTable.createdAt, end)
        )
      )
      .groupBy(
        eventLogTable.userId,
        wikiUserTable.id,
        wikiUserTable.name,
        wikiUserTable.mwUserId,
        wikiUserTable.siteId
      )
      .orderBy(desc(sql`count(*)`))
      .limit(TOP_N)
      .all()

    await kv.put(
      userKey,
      JSON.stringify({
        data: userRows,
        window: window.name,
        start,
        end,
        updatedAt: now,
      }),
      { expirationTtl: 2 * ONE_DAY }
    )
  }
}

async function preCalculateTotals(
  drizzle_: any,
  kv: KVNamespace,
  now: number
) {
  for (const window of PRECALC_WINDOWS) {
    const start = now - window.days * ONE_DAY
    const end = now

    const whereClause = and(
      gte(eventLogTable.createdAt, start),
      lte(eventLogTable.createdAt, end)
    )

    // Total usage
    const totalUsageRows = await drizzle_
      .select({ total: count() })
      .from(eventLogTable)
      .where(whereClause)
      .all()

    // Total users
    const totalUsersRows = await drizzle_
      .select({ total: sql<number>`count(distinct ${eventLogTable.userId})` })
      .from(eventLogTable)
      .where(whereClause)
      .all()

    // Total sites
    const totalSitesRows = await drizzle_
      .select({ total: sql<number>`count(distinct ${eventLogTable.siteId})` })
      .from(eventLogTable)
      .where(whereClause)
      .all()

    const key = `${PRECALC_KEY_PREFIX}:usage:total:${window.name}`
    await kv.put(
      key,
      JSON.stringify({
        data: {
          total: totalUsageRows[0]?.total ?? 0,
          users: totalUsersRows[0]?.total ?? 0,
          sites: totalSitesRows[0]?.total ?? 0,
        },
        window: window.name,
        start,
        end,
        updatedAt: now,
      }),
      { expirationTtl: 2 * ONE_DAY }
    )
  }

  // All-time totals
  const allTimeKey = `${PRECALC_KEY_PREFIX}:usage:total:all_time`
  const totalUsageRows = await drizzle_
    .select({ total: count() })
    .from(eventLogTable)
    .all()

  const totalUsersRows = await drizzle_
    .select({ total: sql<number>`count(distinct ${eventLogTable.userId})` })
    .from(eventLogTable)
    .all()

  const totalSitesRows = await drizzle_
    .select({ total: sql<number>`count(distinct ${eventLogTable.siteId})` })
    .from(eventLogTable)
    .all()

  await kv.put(
    allTimeKey,
    JSON.stringify({
      data: {
        total: totalUsageRows[0]?.total ?? 0,
        users: totalUsersRows[0]?.total ?? 0,
        sites: totalSitesRows[0]?.total ?? 0,
      },
      window: 'all_time',
      updatedAt: now,
    }),
    { expirationTtl: 2 * ONE_DAY }
  )
}
