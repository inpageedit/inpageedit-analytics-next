import { and, count, eq, gte, lte } from 'drizzle-orm'
import { eventLogTable } from '~~/db/schema.js'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const siteId = parseInt(String(query.siteId || ''))
  const userId = parseInt(String(query.userId || ''))
  let start = query.start ? parseInt(String(query.start)) : undefined
  let end = query.end ? parseInt(String(query.end)) : undefined

  // 允许毫秒时间戳，自动转为秒
  if (start && start > 1_000_000_000_000) start = Math.floor(start / 1000)
  if (end && end > 1_000_000_000_000) end = Math.floor(end / 1000)

  const drizzle = useDrizzle(event)

  const whereClause = and(
    Number.isFinite(siteId) && siteId
      ? eq(eventLogTable.siteId, siteId)
      : undefined,
    Number.isFinite(userId) && userId
      ? eq(eventLogTable.userId, userId)
      : undefined,
    start ? gte(eventLogTable.createdAt, start) : undefined,
    end ? lte(eventLogTable.createdAt, end) : undefined
  )

  const totalRows = await drizzle
    .select({ total: count() })
    .from(eventLogTable)
    .where(whereClause)
    .all()

  const total = totalRows[0]?.total ?? 0

  const features = await drizzle
    .select({ feature: eventLogTable.feature, count: count() })
    .from(eventLogTable)
    .where(whereClause)
    .groupBy(eventLogTable.feature)
    .all()

  return Response.json({
    data: {
      total,
      features: Object.fromEntries(features.map((f) => [f.feature, f.count])),
    },
    filters: {
      siteId: Number.isFinite(siteId) && siteId ? siteId : undefined,
      userId: Number.isFinite(userId) && userId ? userId : undefined,
      start,
      end,
    },
  })
})
