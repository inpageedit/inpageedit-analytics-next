import { and, desc, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable, wikiUserTable } from '~~/db/schema.js'
import {
  buildCacheKey,
  getOrSetJson,
  getVersionsForContext,
  buildVersionString,
  TTL_SHORT,
} from '~~/server/utils/cache.js'

interface RecentUsageResponse {
  data: any[]
  filters: {
    siteId: number | null
    userId: number | null
  }
  pager: {
    limit: number
    offset: number
    hasMore: boolean
  }
  cached?: boolean
}

// Only cache first few pages with short TTL
const MAX_CACHED_OFFSET = 100

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const { limit, offset } = getPagerParams(event)

  // 获取可选的过滤参数
  const siteId = query.siteId ? parseInt(String(query.siteId)) : undefined
  const userId = query.userId ? parseInt(String(query.userId)) : undefined

  // Only cache first few pages
  const shouldCache = offset <= MAX_CACHED_OFFSET

  if (shouldCache) {
    // Get version numbers for cache key
    const versions = await getVersionsForContext(event, siteId, userId)
    const versionStr = buildVersionString(versions)

    // Build cache key
    const cacheKey = buildCacheKey(
      'usage',
      'recent',
      {
        site: siteId ?? 0,
        user: userId ?? 0,
        limit,
        offset,
      },
      versionStr
    )

    // Try to get from cache or execute query
    const result = await getOrSetJson<RecentUsageResponse>(
      event,
      cacheKey,
      TTL_SHORT,
      async () => fetchRecentUsage(event, siteId, userId, limit, offset)
    )

    return Response.json({
      ...result.data,
      cached: result.cached,
    })
  }

  // For deeper pages, skip caching
  const data = await fetchRecentUsage(event, siteId, userId, limit, offset)
  return Response.json(data)
})

async function fetchRecentUsage(
  event: any,
  siteId: number | undefined,
  userId: number | undefined,
  limit: number,
  offset: number
): Promise<RecentUsageResponse> {
  const drizzle = useDrizzle(event)

  // 构建过滤条件
  const conditions = []
  if (siteId && !isNaN(siteId)) {
    conditions.push(eq(eventLogTable.siteId, siteId))
  }
  if (userId && !isNaN(userId)) {
    conditions.push(eq(eventLogTable.userId, userId))
  }

  // 构建查询
  let queryBuilder = drizzle
    .select({
      event: eventLogTable,
      user: wikiUserTable,
      site: wikiSiteTable,
    })
    .from(eventLogTable)
    .leftJoin(wikiUserTable, eq(eventLogTable.userId, wikiUserTable.id))
    .leftJoin(wikiSiteTable, eq(eventLogTable.siteId, wikiSiteTable.id))

  // 添加过滤条件
  if (conditions.length > 0) {
    queryBuilder = queryBuilder.where(
      conditions.length === 1 ? conditions[0] : and(...conditions)
    ) as any
  }

  const rows = await queryBuilder
    .orderBy(desc(eventLogTable.createdAt))
    .limit(limit + 1)
    .offset(offset)
    .all()

  return {
    data: rows
      .map((r) => ({
        ...r.event,
        user: r.user,
        site: r.site,
      }))
      .slice(0, limit),
    filters: {
      siteId: siteId || null,
      userId: userId || null,
    },
    pager: {
      limit,
      offset,
      hasMore: rows.length > limit,
    },
  }
}
