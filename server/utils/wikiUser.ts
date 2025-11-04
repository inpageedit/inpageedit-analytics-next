import type { H3Event } from 'h3'
import { wikiUserTable } from '@@/db/schema.js'
import { and, eq, sql } from 'drizzle-orm'

export const getWikiUserFromDB = async (
  event: H3Event,
  siteId: number,
  mwUserId: number,
  userName: string
) => {
  const drizzle = useDrizzle(event)
  const [user] = await drizzle
    .insert(wikiUserTable)
    .values({ name: userName, siteId, mwUserId })
    .onConflictDoUpdate({
      target: [wikiUserTable.siteId, wikiUserTable.mwUserId],
      set: { name: userName, updatedAt: sql`(STRFTIME('%s', 'now'))` },
      where: sql`${wikiUserTable.name} IS NOT ${userName}`,
    })
    .returning()
  if (user) return user

  // sometimes, RETURNING is not supported, so we need to fallback to select
  const [fallback] = await drizzle
    .select()
    .from(wikiUserTable)
    .where(
      and(
        eq(wikiUserTable.siteId, siteId),
        eq(wikiUserTable.mwUserId, mwUserId)
      )
    )
    .limit(1)
  if (fallback) return fallback

  throw new Error('Failed to insert wiki user to DB')
}
