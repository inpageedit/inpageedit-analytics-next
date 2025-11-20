import { drizzle } from 'drizzle-orm/d1'
import type { H3Event } from 'h3'

export const useCF = (e: H3Event) => {
  return e.context.cloudflare
}

export const useCFEnv = (e: H3Event) => {
  return useCF(e)?.env
}

export const useD1 = (e: H3Event) => {
  if (typeof e.context.D1 === 'undefined') {
    e.context.D1 = useCFEnv(e)?.D1
  }
  return e.context.D1
}

export const useKV = (e: H3Event) => {
  if (typeof e.context.KV === 'undefined') {
    e.context.KV = useCFEnv(e)?.KV
  }
  return e.context.KV
}

export const useDrizzle = (e: H3Event) => {
  if (typeof e.context.drizzle === 'undefined') {
    const d1 = useD1(e)
    d1 && (e.context.drizzle = drizzle(d1, { casing: 'snake_case' }))
  }
  return e.context.drizzle
}
