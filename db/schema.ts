import { sql } from 'drizzle-orm'
import { sqliteTable as table, text, index, uniqueIndex, integer } from 'drizzle-orm/sqlite-core'

const CURRENT_TIMESTAMP_INTEGER = sql`(STRFTIME('%s', 'now'))`
const useCurrentTimestamp = () => integer().notNull().default(CURRENT_TIMESTAMP_INTEGER)
const useTimestampColumns = () => ({
  createdAt: useCurrentTimestamp(),
  updatedAt: useCurrentTimestamp(),
})

export const wikiSiteTable = table(
  'wiki_site',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    apiUrl: text().notNull(),
    articlePath: text().notNull(),
    migratedToId: integer().references((): any => wikiSiteTable.id, {
      onDelete: 'set null',
    }),
    ...useTimestampColumns(),
  },
  (t) => [
    uniqueIndex('ux_site_api_url').on(t.apiUrl),
    index('ix_site_migrated_to').on(t.migratedToId),
  ]
)

export const wikiUserTable = table(
  'wiki_user',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    mwUserId: integer().notNull(),
    siteId: integer()
      .notNull()
      .references(() => wikiSiteTable.id),
    ...useTimestampColumns(),
  },
  (t) => [
    uniqueIndex('ux_site_user').on(t.siteId, t.mwUserId),
    index('ix_user_site_name').on(t.siteId, t.name),
  ]
)

export const eventLogTable = table(
  'event_log',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    siteId: integer()
      .notNull()
      .references(() => wikiSiteTable.id, { onDelete: 'restrict' }),
    userId: integer()
      .notNull()
      .references(() => wikiUserTable.id, { onDelete: 'restrict' }),
    pageName: text(),
    feature: text().notNull(),
    subtype: text(),
    coreVersion: text(),
    ...useTimestampColumns(),
  },
  (e) => [
    // 1) Fast scan for time-window analytics queries (leaderboards, daily stats, totals).
    //    Includes siteId/userId to make it a covering index for common aggregations.
    index('ix_event_time_site_user').on(e.createdAt, e.siteId, e.userId),

    // 2) Fast lookups when filtering by site/user (usage pages, recent list with filters).
    index('ix_event_site_time').on(e.siteId, e.createdAt),
    index('ix_event_user_time').on(e.userId, e.createdAt),
  ]
)
