import type { H3Event } from 'h3'

// Key prefixes
export const CACHE_KEY_PREFIX = 'ipea:v6'
export const VERSION_KEY_PREFIX = 'ipea:ver'
export const PRECALC_KEY_PREFIX = 'ipea:precalc'

// Time constants (in seconds)
export const ONE_HOUR = 3600
export const ONE_DAY = 86400
export const FROZEN_WINDOW_OFFSET = ONE_HOUR // Data before this is immutable

// TTL configurations (in seconds)
export const TTL_LONG = 7 * ONE_DAY // 7 days for immutable windows
export const TTL_MEDIUM = 5 * 60 // 5 minutes for mixed windows
export const TTL_SHORT = 30 // 30 seconds for hot windows
export const TTL_SEARCH = 30 * 60 // 30 minutes for search results

export interface CacheOptions {
  ttl?: number
  tags?: string[]
}

export interface CacheResult<T> {
  data: T
  cached: boolean
  key?: string
}

/**
 * Get current timestamp in seconds
 */
export const getNowSeconds = (): number => {
  return Math.floor(Date.now() / 1000)
}

/**
 * Calculate frozen boundary timestamp
 * Data before this timestamp is immutable (won't receive new writes)
 */
export const getFrozenBefore = (): number => {
  return getNowSeconds() - FROZEN_WINDOW_OFFSET
}

/**
 * Determine window type based on time range
 * - 'frozen': end <= frozenBefore (immutable, long TTL)
 * - 'mixed': start < frozenBefore < end (medium TTL + version)
 * - 'hot': start >= frozenBefore (short TTL + version)
 */
export const getWindowType = (
  start: number | undefined,
  end: number | undefined
): 'frozen' | 'mixed' | 'hot' => {
  const frozenBefore = getFrozenBefore()
  const effectiveEnd = end ?? getNowSeconds()
  const effectiveStart = start ?? 0

  if (effectiveEnd <= frozenBefore) {
    return 'frozen'
  }
  if (effectiveStart < frozenBefore && effectiveEnd > frozenBefore) {
    return 'mixed'
  }
  return 'hot'
}

/**
 * Get appropriate TTL based on window type
 */
export const getTTLForWindow = (windowType: 'frozen' | 'mixed' | 'hot'): number => {
  switch (windowType) {
    case 'frozen':
      return TTL_LONG
    case 'mixed':
      return TTL_MEDIUM
    case 'hot':
      return TTL_SHORT
  }
}

/**
 * Normalize timestamp to day boundary (00:00:00)
 */
export const normalizeToDayStart = (timestamp: number): number => {
  const date = new Date(timestamp * 1000)
  date.setUTCHours(0, 0, 0, 0)
  return Math.floor(date.getTime() / 1000)
}

/**
 * Normalize timestamp to day end (23:59:59)
 */
export const normalizeToDayEnd = (timestamp: number): number => {
  const date = new Date(timestamp * 1000)
  date.setUTCHours(23, 59, 59, 999)
  return Math.floor(date.getTime() / 1000)
}

/**
 * Build cache key with normalized parameters
 */
export const buildCacheKey = (
  group: string,
  endpoint: string,
  params: Record<string, string | number | undefined>,
  version?: number | string
): string => {
  const parts: string[] = [CACHE_KEY_PREFIX, group, endpoint]

  // Sort keys for consistent ordering
  const sortedKeys = Object.keys(params).sort()
  for (const key of sortedKeys) {
    const value = params[key]
    if (value !== undefined && value !== '') {
      parts.push(`${key}=${value}`)
    }
  }

  if (version !== undefined) {
    parts.push(`ver=${version}`)
  }

  return parts.join(':')
}

/**
 * Get version key for global/site/user
 */
export const getVersionKey = (type: 'global' | 'site' | 'user', id?: number): string => {
  if (type === 'global') {
    return `${VERSION_KEY_PREFIX}:global`
  }
  return `${VERSION_KEY_PREFIX}:${type}:${id}`
}

/**
 * Get or set JSON cache value
 * Returns cached value if exists, otherwise executes loader and caches result
 */
export const getOrSetJson = async <T>(
  event: H3Event,
  key: string,
  ttl: number,
  loader: () => Promise<T>
): Promise<CacheResult<T>> => {
  const kv = useKV(event)

  if (!kv) {
    // KV not available, execute loader directly
    const data = await loader()
    return { data, cached: false }
  }

  try {
    // Try to get from cache
    const cached = await kv.get(key, 'json')
    if (cached !== null) {
      return { data: cached as T, cached: true, key }
    }
  } catch {
    // Cache miss or error, continue to loader
  }

  // Execute loader and cache result
  const data = await loader()

  try {
    // Only cache if TTL is valid (not Infinity)
    if (Number.isFinite(ttl) && ttl > 0) {
      await kv.put(key, JSON.stringify(data), { expirationTtl: ttl })
    }
  } catch {
    // Ignore cache write errors
  }

  return { data, cached: false, key }
}

/**
 * Get version number from KV
 */
export const getVersion = async (
  event: H3Event,
  type: 'global' | 'site' | 'user',
  id?: number
): Promise<number> => {
  const kv = useKV(event)
  if (!kv) return 0

  const key = getVersionKey(type, id)
  try {
    const version = await kv.get(key)
    return version ? parseInt(version, 10) : 0
  } catch {
    return 0
  }
}

/**
 * Update version number in KV
 */
export const bumpVersion = async (
  event: H3Event,
  type: 'global' | 'site' | 'user',
  id?: number
): Promise<void> => {
  const kv = useKV(event)
  if (!kv) return

  const key = getVersionKey(type, id)
  const now = getNowSeconds()

  try {
    await kv.put(key, now.toString())
  } catch {
    // Ignore version update errors
  }
}

/**
 * Invalidate cache by bumping relevant versions
 * Call this after write operations
 */
export const invalidateCache = async (
  event: H3Event,
  siteId?: number,
  userId?: number
): Promise<void> => {
  // NOTE:
  // We intentionally DO NOT bump the global version on every write.
  // Global caches (e.g. leaderboards without site/user filters) are allowed to be stale
  // within their TTL window to avoid invalidating all hot caches on each submission.
  if (siteId) {
    await bumpVersion(event, 'site', siteId)
  }
  if (userId) {
    await bumpVersion(event, 'user', userId)
  }
}

/**
 * Get appropriate version numbers for a query context
 */
export const getVersionsForContext = async (
  event: H3Event,
  siteId?: number,
  userId?: number
): Promise<{ global: number; site: number; user: number }> => {
  const [global, site, user] = await Promise.all([
    getVersion(event, 'global'),
    siteId ? getVersion(event, 'site', siteId) : Promise.resolve(0),
    userId ? getVersion(event, 'user', userId) : Promise.resolve(0),
  ])

  return { global, site, user }
}

/**
 * Build composite version string for cache key
 */
export const buildVersionString = (versions: {
  global: number
  site: number
  user: number
}): string => {
  return `${versions.global}-${versions.site}-${versions.user}`
}
