import { and, count, countDistinct, eq, gte, lte } from 'drizzle-orm'
import { eventLogTable } from '~~/db/schema.js'
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
  type CacheResult,
} from '~~/server/utils/cache.js'

interface TotalResponse {
  data: {
    total: number
    users: number
    sites: number
  }
  filters: {
    siteId?: number
    userId?: number
    start?: number
    end?: number
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
  const userId = parseInt(String(query.userId || ''))
  let start = query.start ? parseInt(String(query.start)) : undefined
  let end = query.end ? parseInt(String(query.end)) : undefined
  // 允许毫秒时间戳，自动转为秒
  if (start && start > 1_000_000_000_000) start = Math.floor(start / 1000)
  if (end && end > 1_000_000_000_000) end = Math.floor(end / 1000)
  // 简单修复时间戳错误
  if (start && end && start > end) {
    ;[start, end] = [end, start]
  }

  // Check for pre-calculated window (only for global stats without filters)
  const precalcWindow = !siteId && !userId ? getPrecalcWindow(start, end) : null
  if (precalcWindow) {
    const kv = useKV(event)
    if (kv) {
      const precalcKey = `${PRECALC_KEY_PREFIX}:usage:total:${precalcWindow}`
      try {
        const precalc = await kv.get(precalcKey, 'json') as { data?: { total: number; users: number; sites: number } } | null
        if (precalc && precalc.data) {
          return Response.json({
            data: precalc.data,
            filters: {
              siteId: undefined,
              userId: undefined,
              start,
              end,
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
      Number.isFinite(userId) && userId ? userId : undefined
    )
    versionStr = buildVersionString(versions)
  }

  // Build cache key
  const cacheKey = buildCacheKey(
    'usage',
    'total',
    {
      site: Number.isFinite(siteId) && siteId ? siteId : 0,
      user: Number.isFinite(userId) && userId ? userId : 0,
      start: start ?? 0,
      end: end ?? 0,
    },
    versionStr || undefined
  )

  // Try to get from cache or execute query
  const result = await getOrSetJson<TotalResponse>(
    event,
    cacheKey,
    ttl,
    async () => {
      const drizzle = useDrizzle(event)

      const whereClause = and(
        Number.isFinite(siteId) && siteId
          ? eq(eventLogTable.siteId, siteId)
          : undefined,
        Number.isFinite(userId) && userId
          ? eq(eventLogTable.userId, userId)
          : undefined,
        start ? gte(eventLogTable.createdAt, start) : undefined,
        end ? lte(eventLogTable.createdAt, end) : undefined
      )

      // 总使用量：事件总数
      const totalUsageRows = await drizzle
        .select({ total: count() })
        .from(eventLogTable)
        .where(whereClause)
        .all()

      const totalUsage = totalUsageRows[0]?.total ?? 0

      // 总用户量：去重 userId 数
      const totalUsersRows = await drizzle
        .select({ total: countDistinct(eventLogTable.userId) })
        .from(eventLogTable)
        .where(whereClause)
        .all()

      const totalUsers = totalUsersRows[0]?.total ?? 0

      // 总站点数：去重 siteId 数
      const totalSitesRows = await drizzle
        .select({ total: countDistinct(eventLogTable.siteId) })
        .from(eventLogTable)
        .where(whereClause)
        .all()

      const totalSites = totalSitesRows[0]?.total ?? 0

      return {
        data: { total: totalUsage, users: totalUsers, sites: totalSites },
        filters: {
          siteId: Number.isFinite(siteId) && siteId ? siteId : undefined,
          userId: Number.isFinite(userId) && userId ? userId : undefined,
          start,
          end,
        },
      }
    }
  )

  return Response.json({
    ...result.data,
    cached: result.cached,
  })
})
