import { and, count, countDistinct, eq, gte, lte } from 'drizzle-orm'
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

  // 总使用量：事件总数
  const totalUsageRows = await drizzle
    .select({ total: count() })
    .from(eventLogTable)
    .where(whereClause)
    .all()

  const totalUsage = totalUsageRows[0]?.total ?? 0

  // 总用户量：去重 userId 数
  const totalUsersRows = await drizzle
    .select({ total: countDistinct(eventLogTable.userId) })
    .from(eventLogTable)
    .where(whereClause)
    .all()

  const totalUsers = totalUsersRows[0]?.total ?? 0

  // 总站点数：去重 siteId 数
  const totalSitesRows = await drizzle
    .select({ total: countDistinct(eventLogTable.siteId) })
    .from(eventLogTable)
    .where(whereClause)
    .all()

  const totalSites = totalSitesRows[0]?.total ?? 0

  return Response.json({
    data: { total: totalUsage, users: totalUsers, sites: totalSites },
    filters: {
      siteId: Number.isFinite(siteId) && siteId ? siteId : undefined,
      userId: Number.isFinite(userId) && userId ? userId : undefined,
      start,
      end,
    },
  })
})
