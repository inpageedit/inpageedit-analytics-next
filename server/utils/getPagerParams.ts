import type { H3Event } from 'h3'

const DEFAULT_LIMIT = 10
const DEFAULT_OFFSET = 0
const MAX_LIMIT = 100

export const getPagerParams = (event: H3Event) => {
  const query = getQuery(event)
  let limit = parseInt(String(query.limit)) || DEFAULT_LIMIT
  let offset = parseInt(String(query.offset)) || DEFAULT_OFFSET
  limit = Math.max(0, Math.min(limit, MAX_LIMIT))
  offset = Math.max(0, offset)
  return {
    limit,
    offset,
  }
}
