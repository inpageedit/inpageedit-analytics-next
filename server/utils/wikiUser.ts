import type { H3Event } from 'h3'
import { wikiUserTable } from '@@/db/schema.js'
import { and, eq, or, sql } from 'drizzle-orm'

export const ensureWikiUserByPayload = async (
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

/**
 * 查找 WikiUser 记录（只查询，不创建）
 * 支持在多个站点 ID 中查找（用于处理站点迁移场景）
 * @param siteIds 站点 ID 或站点 ID 数组
 * @returns 找到的用户记录，如果不存在则返回 null
 */
export const findWikiUser = async (
  event: H3Event,
  siteIds: number | number[],
  mwUserId: number
) => {
  const drizzle = useDrizzle(event)
  const siteIdArray = Array.isArray(siteIds) ? siteIds : [siteIds]

  const [user] = await drizzle
    .select()
    .from(wikiUserTable)
    .where(
      and(
        eq(wikiUserTable.mwUserId, mwUserId),
        siteIdArray.length === 1
          ? eq(wikiUserTable.siteId, siteIdArray[0])
          : or(...siteIdArray.map((id) => eq(wikiUserTable.siteId, id)))
      )
    )
    .limit(1)

  return user ?? null
}
