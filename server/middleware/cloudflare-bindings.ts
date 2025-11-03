import { D1Database, KVNamespace } from '@cloudflare/workers-types'
import { DrizzleD1Database } from 'drizzle-orm/d1'

declare module 'h3' {
  interface H3EventContext {
    D1: D1Database
    KV: KVNamespace
    drizzle: DrizzleD1Database
  }
}

export default eventHandler((event) => {
  useCF(event)
  useD1(event)
  useKV(event)
  useDrizzle(event)
})
