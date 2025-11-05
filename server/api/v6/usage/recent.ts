import { and, desc, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable, wikiUserTable } from '~~/db/schema.js'

export default eventHandler(async (event) => {
  const drizzle = useDrizzle(event)
  const query = getQuery(event)
  const { limit, offset } = getPagerParams(event)

  // 获取可选的过滤参数
  const siteId = query.siteId ? parseInt(String(query.siteId)) : undefined
  const userId = query.userId ? parseInt(String(query.userId)) : undefined

  // 构建过滤条件
  const conditions = []
  if (siteId && !isNaN(siteId)) {
    conditions.push(eq(eventLogTable.siteId, siteId))
  }
  if (userId && !isNaN(userId)) {
    conditions.push(eq(eventLogTable.userId, userId))
  }

  // 构建查询
  let queryBuilder = drizzle
    .select({
      event: eventLogTable,
      user: wikiUserTable,
      site: wikiSiteTable,
    })
    .from(eventLogTable)
    .leftJoin(wikiUserTable, eq(eventLogTable.userId, wikiUserTable.id))
    .leftJoin(wikiSiteTable, eq(eventLogTable.siteId, wikiSiteTable.id))

  // 添加过滤条件
  if (conditions.length > 0) {
    queryBuilder = queryBuilder.where(
      conditions.length === 1 ? conditions[0] : and(...conditions)
    ) as any
  }

  const rows = await queryBuilder
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
    filters: {
      siteId: siteId || null,
      userId: userId || null,
    },
    pager: {
      limit,
      offset,
      hasMore: rows.length > limit,
    },
  })
})
