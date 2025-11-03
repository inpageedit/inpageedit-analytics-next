import { sql } from 'drizzle-orm'
import {
  sqliteTable as table,
  text,
  index,
  uniqueIndex,
  integer,
  check,
} from 'drizzle-orm/sqlite-core'

const CURRENT_TIMESTAMP_INTEGER = sql`(STRFTIME('%s', 'now'))`

const timestamp = {
  createdAt: integer().notNull().default(CURRENT_TIMESTAMP_INTEGER),
  updatedAt: integer().notNull().default(CURRENT_TIMESTAMP_INTEGER),
}

export const wikiSiteTable = table(
  'wiki_site',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    apiUrl: text().notNull(),
    articlePath: text().notNull(),
    migratedToSiteId: integer().references((): any => wikiSiteTable.id, {
      onDelete: 'set null',
    }),
    ...timestamp,
  },
  (t) => [
    uniqueIndex('ux_site_api_url').on(t.apiUrl),
    index('ix_site_migrated_to').on(t.migratedToSiteId),
  ]
)

export const wikiUserTable = table(
  'wiki_user',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    wikiUserId: integer().notNull(),
    siteId: integer()
      .notNull()
      .references(() => wikiSiteTable.id),
    ...timestamp,
  },
  (t) => [uniqueIndex('ux_site_user').on(t.siteId, t.wikiUserId)]
)

export const eventLogTable = table('event_log', {
  id: integer().primaryKey({ autoIncrement: true }),
  siteId: integer()
    .notNull()
    .references(() => wikiSiteTable.id, { onDelete: 'restrict' }),
  userId: integer()
    .notNull()
    .references(() => wikiUserTable.id, { onDelete: 'restrict' }),
  page: text(),
  feature: text().notNull(),
  subtype: text(),
  eventAt: integer().notNull().default(CURRENT_TIMESTAMP_INTEGER),
})

export const usageRollupTable = table(
  'usage_rollup',
  {
    // 维度：哨兵值表示“汇总”
    siteId: integer().notNull().default(0), // 0 = all sites
    userId: integer().notNull().default(0), // 0 = all users
    feature: text().notNull().default(''), // '' = all features

    // 时间维度
    periodKind: text().notNull(), // 'all' | 'year' | 'month' | 'day'
    periodStart: integer().notNull().default(0), // unix seconds of bucket start; 0 for 'all'

    // 指标
    count: integer().notNull().default(0),
  },
  (t) => [
    uniqueIndex('ux_rollup_key').on(
      t.periodKind,
      t.periodStart,
      t.siteId,
      t.userId,
      t.feature
    ),
    index('ix_rollup_period_bucket').on(t.periodKind, t.periodStart),
    index('ix_rollup_site').on(t.siteId),
    index('ix_rollup_user').on(t.userId),
    index('ix_rollup_feature').on(t.feature),
  ]
)
