import type { H3Event } from 'h3'
import { wikiSiteTable } from '@@/db/schema.js'
import { eq, sql } from 'drizzle-orm'
import { MediaWikiApi } from 'wiki-saikou'

export const getWikiSiteFromDB = async (event: H3Event, apiUrl: string) => {
  const drizzle = useDrizzle(event)

  const [existed] = await drizzle
    .select()
    .from(wikiSiteTable)
    .where(eq(wikiSiteTable.apiUrl, apiUrl))
    .limit(1)
  if (existed) return existed

  const siteInfo = await fetchSiteInfoFromAPI(apiUrl)
  const general = siteInfo?.query?.general
  if (!general) {
    throw new Error('Failed to fetch siteinfo from API')
  }

  const inserted = await createWikiSiteToDB(
    event,
    general.sitename,
    apiUrl,
    general.articlepath
  )
  return inserted
}

export const createWikiSiteToDB = async (
  event: H3Event,
  siteName: string,
  apiUrl: string,
  articlePath: string
) => {
  const drizzle = useDrizzle(event)
  const inserted = await drizzle
    .insert(wikiSiteTable)
    .values({
      name: siteName,
      apiUrl,
      articlePath: articlePath,
    })
    .onConflictDoUpdate({
      target: wikiSiteTable.apiUrl,
      set: {
        name: siteName,
        articlePath: articlePath,
        updatedAt: sql`(STRFTIME('%s', 'now'))`,
      },
    })
    .returning()
  if (inserted[0]) return inserted[0]
  throw new Error('Failed to insert wiki site to DB')
}

export const fetchSiteInfoFromAPI = async (apiUrl: string) => {
  const api = new MediaWikiApi({
    baseURL: apiUrl,
  })
  const { data } = await api.get<{
    query: {
      general: WikiSiteInfoGeneral
    }
  }>({
    action: 'query',
    meta: 'siteinfo',
  })
  return data
}
