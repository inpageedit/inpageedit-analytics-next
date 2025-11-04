import { desc, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable, wikiUserTable } from '~~/db/schema.js'

export default eventHandler(async (event) => {
  const drizzle = useDrizzle(event)
  const { limit, offset } = getPagerParams(event)
  const rows = await drizzle
    .select({
      event: eventLogTable,
      user: wikiUserTable,
      site: wikiSiteTable,
    })
    .from(eventLogTable)
    .leftJoin(wikiUserTable, eq(eventLogTable.userId, wikiUserTable.id))
    .leftJoin(wikiSiteTable, eq(eventLogTable.siteId, wikiSiteTable.id))
    .orderBy(desc(eventLogTable.createdAt))
    .limit(limit + 1)
    .offset(offset)
    .all()
  return Response.json({
    data: rows
      .map((r) => ({
        ...r.event,
        user: r.user,
        site: r.site,
      }))
      .slice(0, limit),
    pager: {
      limit,
      offset,
      hasMore: rows.length > limit,
    },
  })
})
