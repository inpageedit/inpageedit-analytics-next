import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { eventLogTable } from '~~/db/schema.js'

const MAX_DAYS = 180
const DEFAULT_DAYS = 30
const SECONDS_PER_DAY = 86400

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const siteId = parseInt(String(query.siteId || ''))
  const userId = parseInt(String(query.userId || ''))
  let start = query.start ? parseInt(String(query.start)) : undefined
  let end = query.end ? parseInt(String(query.end)) : undefined

  // 允许毫秒时间戳，自动转为秒
  if (start && start > 1_000_000_000_000) start = Math.floor(start / 1000)
  if (end && end > 1_000_000_000_000) end = Math.floor(end / 1000)

  const now = Math.floor(Date.now() / 1000)

  // 如果 start 和 end 都没有提供，默认查询最近 30 天
  if (!start && !end) {
    end = now
    start = now - DEFAULT_DAYS * SECONDS_PER_DAY
  } else {
    // 如果只提供了其中一个，补全另一个
    if (!end) {
      end = now
    }
    if (!start) {
      start = end - DEFAULT_DAYS * SECONDS_PER_DAY
    }
  }

  // 检查时间范围是否超过180天
  const timeRangeInDays = (end - start) / SECONDS_PER_DAY
  if (timeRangeInDays > MAX_DAYS) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: `时间范围不能超过 ${MAX_DAYS} 天。当前请求的时间范围为 ${Math.ceil(
        timeRangeInDays
      )} 天。`,
    })
  }

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

  // 按天分组统计
  const dailyStats = await drizzle
    .select({
      date: sql<string>`strftime('%Y-%m-%d', ${eventLogTable.createdAt}, 'unixepoch')`,
      count: count(),
    })
    .from(eventLogTable)
    .where(whereClause)
    .groupBy(sql`strftime('%Y-%m-%d', ${eventLogTable.createdAt}, 'unixepoch')`)
    .orderBy(sql`strftime('%Y-%m-%d', ${eventLogTable.createdAt}, 'unixepoch')`)
    .all()

  return Response.json({
    data: dailyStats,
    filters: {
      siteId: Number.isFinite(siteId) && siteId ? siteId : undefined,
      userId: Number.isFinite(userId) && userId ? userId : undefined,
      start,
      end,
    },
  })
})
