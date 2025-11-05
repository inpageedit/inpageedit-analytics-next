import { and, eq } from 'drizzle-orm'
import { wikiSiteTable, wikiUserTable } from '~~/db/schema.js'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const siteApi = String(query.siteApi || '').trim()

  if (!siteApi) {
    return Response.json({
      error: true,
      message: 'Missing required fields',
    })
  }

  const drizzle = useDrizzle(event)

  const [site] = await drizzle
    .select({
      id: wikiSiteTable.id,
    })
    .from(wikiSiteTable)
    .where(and(eq(wikiSiteTable.apiUrl, siteApi)))
    .limit(1)

  if (!site?.id) {
    return new Response(null, {
      headers: {
        location: '/404?code=site_not_found',
      },
      status: 307,
    })
  }
  return new Response(null, {
    headers: {
      location: `/site/${site.id}`,
      // this will never change, so we can set a long cache
      'cache-control': 'max-age=2592000',
    },
    status: 308,
  })
})
