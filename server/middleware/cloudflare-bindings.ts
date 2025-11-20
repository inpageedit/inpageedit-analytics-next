import { D1Database, KVNamespace } from '@cloudflare/workers-types'
import { DrizzleD1Database } from 'drizzle-orm/d1'
import { H3Error } from 'h3'

declare module 'h3' {
  interface H3EventContext {
    D1: D1Database
    KV: KVNamespace
    drizzle: DrizzleD1Database
  }
}

export default eventHandler((event) => {
  if (event instanceof H3Error) {
    // skip middleware for error events
    return event
  }
  useCF(event)
  useD1(event)
  useKV(event)
  useDrizzle(event)
})
