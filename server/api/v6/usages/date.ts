import { and, count, eq } from 'drizzle-orm'
import { eventLogTable } from '~~/db/schema.js'

const VALID_PERIODS = ['all', 'year', 'month', 'day']

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const siteId = parseInt('' + query.siteId)
  const userId = parseInt('' + query.userId)
  const feature = query.feature
  const period = VALID_PERIODS.includes('' + query.period)
    ? query.period
    : undefined
  const start = query.start
  const end = query.end

  const drizzle = useDrizzle(event)

  const [usages] = await drizzle
    .select({
      count: count(),
    })
    .from(eventLogTable)
    .where(
      and(
        siteId ? eq(eventLogTable.siteId, siteId) : undefined,
        userId ? eq(eventLogTable.userId, userId) : undefined
      )
    )
    .groupBy(eventLogTable.eventAt)
    .execute()
  return Response.json(usages)
})
