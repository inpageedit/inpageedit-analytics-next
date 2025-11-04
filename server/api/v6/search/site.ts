import { and, desc, eq, like, sql } from 'drizzle-orm'
import { wikiSiteTable } from '~~/db/schema'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const siteName = String(query.siteName || '').trim()
  let siteUrl = String(query.siteUrl || '').trim()
  const { limit, offset } = getPagerParams(event)
  if (!siteName && !siteUrl) {
    return Response.json({
      data: [],
      limit,
      offset,
      hasMore: false,
    })
  }

  if (siteUrl && !siteUrl.startsWith('http')) {
    siteUrl = `https://${siteUrl}`
  }
  if (siteUrl) {
    siteUrl = new URL(siteUrl).origin
  }

  const drizzle = useDrizzle(event)
  const rows = await drizzle
    .select()
    .from(wikiSiteTable)
    .where(
      and(
        siteName
          ? like(wikiSiteTable.name, sql`${siteName} || '%'`)
          : undefined,
        siteUrl ? like(wikiSiteTable.apiUrl, sql`${siteUrl} || '%'`) : undefined
      )
    )
    .limit(limit + 1)
    .offset(offset)
    .orderBy(desc(wikiSiteTable.createdAt))
    .all()

  return Response.json({
    data: rows.slice(0, limit),
    pager: {
      limit,
      offset,
      hasMore: rows.length > limit,
    },
    filter: {
      siteName,
      siteUrl,
    },
  })
})
