import { and, count, eq } from 'drizzle-orm'
import { eventLogTable } from '~~/db/schema.js'

const VALID_PERIODS = ['all', 'year', 'month', 'day']

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const start = query.start
  const end = query.end

  const drizzle = useDrizzle(event)
})
