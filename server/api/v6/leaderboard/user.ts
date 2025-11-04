import { and, desc, gte, lte, sql, count, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable, wikiUserTable } from '~~/db/schema.js'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const siteId = parseInt(String(query.siteId || ''))
  let start = query.start ? parseInt(String(query.start)) : undefined
  let end = query.end ? parseInt(String(query.end)) : undefined

  // 支持毫秒时间戳，自动转为秒
  if (start && start > 1_000_000_000_000) start = Math.floor(start / 1000)
  if (end && end > 1_000_000_000_000) end = Math.floor(end / 1000)

  const { limit, offset } = getPagerParams(event)
  const drizzle = useDrizzle(event)

  const whereClause = and(
    Number.isFinite(siteId) && siteId
      ? eq(eventLogTable.siteId, siteId)
      : undefined,
    start ? gte(eventLogTable.createdAt, start) : undefined,
    end ? lte(eventLogTable.createdAt, end) : undefined
  )

  // 用户使用总数排行，支持 siteId 过滤
  const rows = await drizzle
    .select({
      userId: eventLogTable.userId,
      count: count(),
      user: wikiUserTable,
      site: wikiSiteTable,
    })
    .from(eventLogTable)
    .leftJoin(wikiUserTable, eq(eventLogTable.userId, wikiUserTable.id))
    .leftJoin(wikiSiteTable, eq(wikiUserTable.siteId, wikiSiteTable.id))
    .where(whereClause)
    .groupBy(
      eventLogTable.userId,
      wikiUserTable.id,
      wikiUserTable.name,
      wikiUserTable.mwUserId,
      wikiUserTable.siteId
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
    filter: {
      start,
      end,
      siteId: Number.isFinite(siteId) && siteId ? siteId : undefined,
    },
  })
})
