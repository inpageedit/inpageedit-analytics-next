import { and, desc, gte, lte, sql, count, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable, wikiUserTable } from '~~/db/schema.js'
import {
  buildCacheKey,
  getOrSetJson,
  getWindowType,
  getTTLForWindow,
  getVersionsForContext,
  buildVersionString,
  PRECALC_KEY_PREFIX,
  getNowSeconds,
  ONE_DAY,
} from '~~/server/utils/cache.js'

interface LeaderboardUserResponse {
  data: any[]
  pager: {
    limit: number
    offset: number
    hasMore: boolean
  }
  filter: {
    start?: number
    end?: number
    siteId?: number
  }
  cached?: boolean
  precalc?: boolean
}

// Check if request matches a pre-calculated window
function getPrecalcWindow(start?: number, end?: number): string | null {
  if (!start || !end) return null

  const now = getNowSeconds()
  const windowDays = Math.round((end - start) / ONE_DAY)
  const windowEndDiff = now - end

  // Only match if end is close to now (within 5 minutes)
  if (windowEndDiff > 300) return null

  // Check for exact window matches
  if (windowDays === 1) return 'last_1d'
  if (windowDays === 7) return 'last_7d'
  if (windowDays === 30) return 'last_30d'

  return null
}

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const siteId = parseInt(String(query.siteId || ''))
  let start = query.start ? parseInt(String(query.start)) : undefined
  let end = query.end ? parseInt(String(query.end)) : undefined

  // 支持毫秒时间戳，自动转为秒
  if (start && start > 1_000_000_000_000) start = Math.floor(start / 1000)
  if (end && end > 1_000_000_000_000) end = Math.floor(end / 1000)

  const { limit, offset } = getPagerParams(event)

  // Check for pre-calculated window (only for global stats, first page with standard limit)
  const precalcWindow = !siteId && offset === 0 && limit <= 50 ? getPrecalcWindow(start, end) : null
  if (precalcWindow) {
    const kv = useKV(event)
    if (kv) {
      const precalcKey = `${PRECALC_KEY_PREFIX}:leaderboard:user:${precalcWindow}`
      try {
        const precalc = await kv.get(precalcKey, 'json') as { data?: any[] } | null
        if (precalc && precalc.data) {
          return Response.json({
            data: precalc.data.slice(0, limit),
            pager: {
              limit,
              offset,
              hasMore: precalc.data.length > limit,
            },
            filter: {
              start,
              end,
              siteId: undefined,
            },
            precalc: true,
          })
        }
      } catch {
        // Fall through to regular cache
      }
    }
  }

  // Determine window type and TTL
  const windowType = getWindowType(start, end)
  const ttl = getTTLForWindow(windowType)

  // Get version numbers for cache key (only for non-frozen windows)
  let versionStr = ''
  if (windowType !== 'frozen') {
    const versions = await getVersionsForContext(
      event,
      Number.isFinite(siteId) && siteId ? siteId : undefined,
      undefined
    )
    versionStr = buildVersionString(versions)
  }

  // Build cache key
  const cacheKey = buildCacheKey(
    'leaderboard',
    'user',
    {
      site: Number.isFinite(siteId) && siteId ? siteId : 0,
      start: start ?? 0,
      end: end ?? 0,
      limit,
      offset,
    },
    versionStr || undefined
  )

  // Try to get from cache or execute query
  const result = await getOrSetJson<LeaderboardUserResponse>(
    event,
    cacheKey,
    ttl,
    async () => {
      const drizzle = useDrizzle(event)

      const whereClause = and(
        Number.isFinite(siteId) && siteId
          ? eq(eventLogTable.siteId, siteId)
          : undefined,
        start ? gte(eventLogTable.createdAt, start) : undefined,
        end ? lte(eventLogTable.createdAt, end) : undefined
      )

      // 用户使用总数排行，支持 siteId 过滤
      const rows = await drizzle
        .select({
          userId: eventLogTable.userId,
          count: count(),
          user: wikiUserTable,
          site: wikiSiteTable,
        })
        .from(eventLogTable)
        .leftJoin(wikiUserTable, eq(eventLogTable.userId, wikiUserTable.id))
        .leftJoin(wikiSiteTable, eq(wikiUserTable.siteId, wikiSiteTable.id))
        .where(whereClause)
        .groupBy(
          eventLogTable.userId,
          wikiUserTable.id,
          wikiUserTable.name,
          wikiUserTable.mwUserId,
          wikiUserTable.siteId
        )
        .orderBy(desc(sql`count(*)`))
        .limit(limit + 1)
        .offset(offset)
        .all()

      return {
        data: rows.slice(0, limit),
        pager: {
          limit,
          offset,
          hasMore: rows.length > limit,
        },
        filter: {
          start,
          end,
          siteId: Number.isFinite(siteId) && siteId ? siteId : undefined,
        },
      }
    }
  )

  return Response.json({
    ...result.data,
    cached: result.cached,
  })
})
