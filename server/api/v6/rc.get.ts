import { desc, eq } from 'drizzle-orm'
import { eventLogTable, wikiUserTable } from '~~/db/schema.js'

export default eventHandler(async (event) => {
  const drizzle = useDrizzle(event)
  const result = await drizzle
    .select()
    .from(eventLogTable)
    .leftJoin(wikiUserTable, eq(eventLogTable.userId, wikiUserTable.id))
    .orderBy(desc(eventLogTable.id))
    .limit(100)
    .all()
  return Response.json(result)
})
