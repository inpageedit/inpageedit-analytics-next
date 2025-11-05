import { findWikiSite } from '~~/server/utils/wikiSite.js'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const siteApi = String(query.siteApi || '').trim()

  if (!siteApi) {
    return Response.json({
      error: true,
      message: 'Missing required fields',
    })
  }

  const siteResult = await findWikiSite(event, siteApi)

  if (!siteResult) {
    return new Response(null, {
      headers: {
        location: '/404?code=site_not_found',
      },
      status: 307,
    })
  }

  return new Response(null, {
    headers: {
      location: `/site/${siteResult.site.id}`,
      // this will never change, so we can set a long cache
      'cache-control': 'max-age=2592000',
    },
    status: 308,
  })
})
