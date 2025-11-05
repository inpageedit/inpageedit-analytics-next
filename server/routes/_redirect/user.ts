import { and, eq } from 'drizzle-orm'
import { wikiSiteTable, wikiUserTable } from '~~/db/schema.js'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const siteApi = String(query.siteApi || '').trim()
  const mwUserId = parseInt(String(query.mwUserId || '0'))

  if (!siteApi || !mwUserId) {
    return Response.json({
      error: true,
      message: 'Missing required fields',
    })
  }

  const drizzle = useDrizzle(event)

  const [user] = await drizzle
    .select({
      id: wikiUserTable.id,
    })
    .from(wikiUserTable)
    .where(
      and(
        eq(wikiUserTable.mwUserId, mwUserId),
        eq(wikiSiteTable.apiUrl, siteApi)
      )
    )
    .leftJoin(wikiSiteTable, eq(wikiUserTable.siteId, wikiSiteTable.id))
    .limit(1)

  if (!user?.id) {
    return new Response(null, {
      headers: {
        location: '/404?code=user_not_found',
      },
      status: 307,
    })
  }
  return new Response(null, {
    headers: {
      location: `/user/${user.id}`,
      // this will never change, so we can set a long cache
      'cache-control': 'max-age=2592000',
    },
    status: 308,
  })
})
