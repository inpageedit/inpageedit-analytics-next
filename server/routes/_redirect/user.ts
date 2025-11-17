import { findWikiSite } from '~~/server/utils/wikiSite.js'
import { findWikiUser } from '~~/server/utils/wikiUser.js'

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

  const siteResult = await findWikiSite(event, siteApi)

  if (!siteResult) {
    return new Response(null, {
      headers: {
        location: '/404?code=site_not_found',
      },
      status: 307,
    })
  }

  // 查找用户，需要考虑用户可能关联到原站点或迁移后的站点
  const siteIds = siteResult.isMigrated
    ? [siteResult.original.id, siteResult.current.id]
    : [siteResult.current.id]

  const user = await findWikiUser(event, siteIds, mwUserId)

  if (!user) {
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
