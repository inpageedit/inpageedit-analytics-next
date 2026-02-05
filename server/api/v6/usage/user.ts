import { count, desc, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable, wikiUserTable } from '~~/db/schema.js'
import {
  buildCacheKey,
  getOrSetJson,
  getVersion,
  TTL_MEDIUM,
} from '~~/server/utils/cache.js'

interface UserUsageResponse {
  data: {
    user: any
    site: any
    total: number
    features: Record<string, number>
  }
  cached?: boolean
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = parseInt(String(query.userId || '0'))

  if (!userId) {
    return Response.json(
      {
        error: true,
        message: 'Invalid user ID',
      },
      {
        status: 400,
      }
    )
  }

  // Get user version for cache key
  const userVersion = await getVersion(event, 'user', userId)
  const cacheKey = buildCacheKey(
    'usage',
    'user',
    { user: userId },
    userVersion || undefined
  )

  // Try to get from cache or execute query
  const result = await getOrSetJson<UserUsageResponse>(
    event,
    cacheKey,
    TTL_MEDIUM,
    async () => {
      const drizzle = useDrizzle(event)

      const [userInfo] = await drizzle
        .select({
          user: wikiUserTable,
          site: wikiSiteTable,
        })
        .from(wikiUserTable)
        .leftJoin(wikiSiteTable, eq(wikiSiteTable.id, wikiUserTable.siteId))
        .where(eq(wikiUserTable.id, userId))
        .all()

      if (!userInfo) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found',
        })
      }

      const [userTotal] = await drizzle
        .select({
          total: count(),
        })
        .from(eventLogTable)
        .where(eq(eventLogTable.userId, userId))
        .all()

      const userFeatures = await drizzle
        .select({
          feature: eventLogTable.feature,
          count: count(),
        })
        .from(eventLogTable)
        .where(eq(eventLogTable.userId, userId))
        .groupBy(eventLogTable.feature)
        .orderBy(desc(eventLogTable.feature))
        .all()

      return {
        data: {
          user: userInfo.user,
          site: userInfo.site,
          total: userTotal?.total ?? 0,
          features: Object.fromEntries(
            userFeatures.map((feature) => [feature.feature, feature.count])
          ),
        },
      }
    }
  )

  return Response.json({
    ...result.data,
    cached: result.cached,
  })
})
