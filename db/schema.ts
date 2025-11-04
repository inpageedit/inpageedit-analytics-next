import { sql } from 'drizzle-orm'
import {
  sqliteTable as table,
  text,
  index,
  uniqueIndex,
  integer,
} from 'drizzle-orm/sqlite-core'

const CURRENT_TIMESTAMP_INTEGER = sql`(STRFTIME('%s', 'now'))`
const COLUMN_DEFAULT_NOW = integer()
  .notNull()
  .default(CURRENT_TIMESTAMP_INTEGER)
const timestamp = {
  createdAt: COLUMN_DEFAULT_NOW,
  updatedAt: COLUMN_DEFAULT_NOW,
}

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
    ...timestamp,
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
    ...timestamp,
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
    createdAt: COLUMN_DEFAULT_NOW,
  },
  (e) => [index('ix_event_time').on(e.createdAt)]
)
