import { count, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const siteId = parseInt(String(query.siteId || '0'))

  if (!siteId) {
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

  const drizzle = useDrizzle(event)

  const [siteInfo] = await drizzle
    .select()
    .from(wikiSiteTable)
    .where(eq(wikiSiteTable.id, siteId))
    .all()

  if (!siteInfo) {
    return Response.json(
      {
        error: true,
        message: 'Site not found',
      },
      {
        status: 404,
      }
    )
  }

  const [siteTotal] = await drizzle
    .select({
      total: count(),
    })
    .from(eventLogTable)
    .where(eq(eventLogTable.siteId, siteId))
    .all()

  return Response.json({
    data: {
      site: siteInfo,
      total: siteTotal?.total ?? 0,
    },
  })
})
