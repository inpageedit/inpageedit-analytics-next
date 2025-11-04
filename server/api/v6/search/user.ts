import { and, desc, eq, like, sql } from 'drizzle-orm'
import { wikiSiteTable, wikiUserTable } from '~~/db/schema'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const userName = String(query.userName).trim()
  const siteId = parseInt(String(query.siteId))
  const { limit, offset } = getPagerParams(event)
  if (!userName) {
    return Response.json({
      data: [],
      limit,
      offset,
      hasMore: false,
    })
  }

  const drizzle = useDrizzle(event)
  const results = await drizzle
    .select()
    .from(wikiUserTable)
    .where(
      and(
        like(wikiUserTable.name, sql`${userName} || '%'`),
        siteId ? eq(wikiUserTable.siteId, siteId) : undefined
      )
    )
    .leftJoin(wikiSiteTable, eq(wikiUserTable.siteId, wikiSiteTable.id))
    .limit(limit + 1)
    .offset(offset)
    .orderBy(desc(wikiUserTable.createdAt))
    .all()

  const rows = results.map((r) => ({
    ...r.wiki_user,
    site: r.wiki_site,
  }))

  return Response.json({
    data: rows.slice(0, limit),
    pager: {
      limit,
      offset,
      hasMore: results.length > limit,
    },
    filter: {
      userName,
      siteId,
    },
  })
})
