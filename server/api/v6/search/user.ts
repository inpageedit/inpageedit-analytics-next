import { and, desc, eq, like, sql } from 'drizzle-orm'
import { wikiSiteTable, wikiUserTable } from '~~/db/schema'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const userName = String(query.userName || '').trim()
  const siteId = parseInt(String(query.siteId || '0'))
  const mwUserId = parseInt(String(query.mwUserId || '0'))
  const siteApi = String(query.siteApi || '').trim()
  const { limit, offset } = getPagerParams(event)

  // 通过 siteApi + mwUserId 精准查找

  if (siteApi && mwUserId) {
    const drizzle = useDrizzle(event)
    const [user] = await drizzle
      .select({
        user: wikiUserTable,
        site: wikiSiteTable,
      })
      .from(wikiUserTable)
      .where(
        and(
          eq(wikiUserTable.siteId, siteId),
          eq(wikiUserTable.mwUserId, mwUserId)
        )
      )
      .leftJoin(wikiSiteTable, eq(wikiUserTable.siteId, wikiSiteTable.id))
      .limit(1)
    return Response.json({
      data: [
        {
          ...user.user,
          site: user.site,
        },
      ],
      pager: { limit: 1, offset: 0, hasMore: false },
      filter: { siteApi, mwUserId },
    })
  }

  // 通过 userName 前缀查找

  if (!userName) {
    return Response.json({
      data: [],
      limit,
      offset,
      hasMore: false,
    })
  }

  const drizzle = useDrizzle(event)
  const results = await drizzle
    .select({
      user: wikiUserTable,
      site: wikiSiteTable,
    })
    .from(wikiUserTable)
    .where(
      and(
        like(wikiUserTable.name, sql`${userName} || '%'`),
        siteId ? eq(wikiUserTable.siteId, siteId) : undefined,
        siteApi ? eq(wikiSiteTable.apiUrl, siteApi) : undefined
      )
    )
    .leftJoin(wikiSiteTable, eq(wikiUserTable.siteId, wikiSiteTable.id))
    .limit(limit + 1)
    .offset(offset)
    .orderBy(desc(wikiUserTable.createdAt))
    .all()

  const rows = results.map((r) => ({
    ...r.user,
    site: r.site,
  }))

  return Response.json({
    data: rows.slice(0, limit),
    pager: {
      limit,
      offset,
      hasMore: results.length > limit,
    },
    filter: {
      userName,
      siteId,
    },
  })
})
