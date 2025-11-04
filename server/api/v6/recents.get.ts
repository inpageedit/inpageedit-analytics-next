import { desc, eq } from 'drizzle-orm'
import { eventLogTable, wikiSiteTable, wikiUserTable } from '~~/db/schema.js'

export default eventHandler(async (event) => {
  const drizzle = useDrizzle(event)
  const result = await drizzle
    .select()
    .from(eventLogTable)
    .leftJoin(wikiUserTable, eq(eventLogTable.userId, wikiUserTable.id))
    .leftJoin(wikiSiteTable, eq(eventLogTable.siteId, wikiSiteTable.id))
    .orderBy(desc(eventLogTable.id))
    .limit(100)
    .all()
  const output = result.map((r) => ({
    ...r.event_log,
    userName: r.wiki_user?.name,
    userWikiId: r.wiki_user?.wikiUserId,
    siteName: r.wiki_site?.name,
    siteApiUrl: r.wiki_site?.apiUrl,
    siteArticlePath: r.wiki_site?.articlePath,
  }))
  return Response.json(output)
})
