import { count, desc, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable, wikiUserTable } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = parseInt(String(query.userId || '0'))

  if (!userId) {
    return Response.json(
      {
        error: true,
        statusText: 'Invalid user ID',
      },
      {
        status: 400,
      }
    )
  }

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
    return Response.json(
      {
        error: true,
        statusText: 'User not found',
      },
      {
        status: 404,
      }
    )
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

  return Response.json({
    data: {
      user: userInfo.user,
      site: userInfo.site,
      total: userTotal?.total ?? 0,
      features: Object.fromEntries(
        userFeatures.map((feature) => [feature.feature, feature.count])
      ),
    },
  })
})
