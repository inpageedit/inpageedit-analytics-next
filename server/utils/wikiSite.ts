import type { H3Event } from 'h3'
import { wikiSiteTable } from '@@/db/schema.js'
import { eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import { MediaWikiApi } from 'wiki-saikou'

/**
 * 根据 apiUrl 获取或创建 WikiSite 记录
 * 如果该站点有 migratedToId，则自动返回迁移目标站点
 */
export const ensureWikiSiteByPayload = async (
  event: H3Event,
  apiUrl: string,
  siteName?: string
) => {
  const existed = await findWikiSite(event, apiUrl)
  if (existed) {
    return existed.current
  }

  // 优先尝试从 API 获取站点信息
  let general: WikiSiteInfoGeneral | undefined
  try {
    const siteInfo = await fetchSiteInfoFromAPI(apiUrl)
    general = siteInfo?.query?.general
  } catch (error) {
    // API 调用失败，继续执行 fallback 逻辑
    console.error('Failed to fetch siteinfo from API:', error)
  }

  let finalSiteName: string
  let finalArticlePath: string

  if (general) {
    // API 查询成功，使用 API 返回的数据
    finalSiteName = general.sitename
    finalArticlePath = general.articlepath
  } else if (siteName) {
    // API 查询失败，但传入了 siteName，使用 fallback 逻辑
    finalSiteName = siteName
    // 将 api.php 替换为 index.php，并加上 ?title=$1
    const path = new URL(apiUrl.replace('api.php', 'index.php')).pathname
    finalArticlePath = `${path}?title=$1`
  } else {
    // API 查询失败，且没有传入 siteName
    throw new Error('Failed to fetch siteinfo from API')
  }

  const inserted = await createWikiSiteToDB(
    event,
    finalSiteName,
    apiUrl,
    finalArticlePath
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

/**
 * 查找 WikiSite 记录（只查询，不创建）
 * 如果该站点有 migratedToId，则自动返回迁移目标站点
 * @returns 找到的站点记录，如果不存在则返回 null
 */
export const findWikiSite = async (event: H3Event, apiUrl: string) => {
  const drizzle = useDrizzle(event)

  // 创建 wikiSiteTable 的别名用于 join
  const migratedToSite = alias(wikiSiteTable, 'migratedToSite')

  const [result] = await drizzle
    .select({
      original: wikiSiteTable,
      migratedTo: migratedToSite,
    })
    .from(wikiSiteTable)
    .leftJoin(migratedToSite, eq(wikiSiteTable.migratedToId, migratedToSite.id))
    .where(eq(wikiSiteTable.apiUrl, apiUrl))
    .limit(1)

  if (!result) return null

  // 返回包含原站点和迁移目标站点的信息
  return {
    /** 当前生效的站点信息 */
    current: result.migratedTo ?? result.original,
    /** 原始站点信息 */
    original: result.original,
    /** 迁移目标站点信息 */
    migratedTo: result.migratedTo,
    /** 是否已迁移 */
    isMigrated: Boolean(result.migratedTo),
  }
}
