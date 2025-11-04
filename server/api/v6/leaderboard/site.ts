import { and, desc, gte, lte, sql, count, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable } from '~~/db/schema.js'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  let start = query.start ? parseInt(String(query.start)) : undefined
  let end = query.end ? parseInt(String(query.end)) : undefined

  // 支持毫秒时间戳，自动转为秒
  if (start && start > 1_000_000_000_000) start = Math.floor(start / 1000)
  if (end && end > 1_000_000_000_000) end = Math.floor(end / 1000)

  const { limit, offset } = getPagerParams(event)
  const drizzle = useDrizzle(event)

  const whereClause = and(
    start ? gte(eventLogTable.createdAt, start) : undefined,
    end ? lte(eventLogTable.createdAt, end) : undefined
  )

  // 站点使用总数排行
  const rows = await drizzle
    .select({
      siteId: eventLogTable.siteId,
      count: count(),
      site: wikiSiteTable,
    })
    .from(eventLogTable)
    .leftJoin(wikiSiteTable, eq(eventLogTable.siteId, wikiSiteTable.id))
    .where(whereClause)
    .groupBy(
      eventLogTable.siteId,
      wikiSiteTable.id,
      wikiSiteTable.name,
      wikiSiteTable.apiUrl
    )
    .orderBy(desc(sql`count(*)`))
    .limit(limit + 1)
    .offset(offset)
    .all()

  return Response.json({
    data: rows.slice(0, limit),
    pager: {
      limit,
      offset,
      hasMore: rows.length > limit,
    },
    filter: { start, end },
  })
})
