import { count, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable } from '~~/db/schema.js'
import {
  buildCacheKey,
  getOrSetJson,
  getVersion,
  TTL_MEDIUM,
} from '~~/server/utils/cache.js'

interface SiteUsageResponse {
  data: {
    site: any
    total: number
  }
  cached?: boolean
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const siteId = parseInt(String(query.siteId || '0'))

  if (!siteId) {
    return Response.json(
      {
        error: true,
        message: 'Invalid site ID',
      },
      {
        status: 400,
      }
    )
  }

  // Get site version for cache key
  const siteVersion = await getVersion(event, 'site', siteId)
  const cacheKey = buildCacheKey(
    'usage',
    'site',
    { site: siteId },
    siteVersion || undefined
  )

  // Try to get from cache or execute query
  const result = await getOrSetJson<SiteUsageResponse>(
    event,
    cacheKey,
    TTL_MEDIUM,
    async () => {
      const drizzle = useDrizzle(event)

      const [siteInfo] = await drizzle
        .select()
        .from(wikiSiteTable)
        .where(eq(wikiSiteTable.id, siteId))
        .all()

      if (!siteInfo) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Site not found',
        })
      }

      const [siteTotal] = await drizzle
        .select({
          total: count(),
        })
        .from(eventLogTable)
        .where(eq(eventLogTable.siteId, siteId))
        .all()

      return {
        data: {
          site: siteInfo,
          total: siteTotal?.total ?? 0,
        },
      }
    }
  )

  return Response.json({
    ...result.data,
    cached: result.cached,
  })
})
