export interface AnalyticsResponse<T = any> {
  error?: boolean
  message?: string
  statusText?: string
  data: T
  filters: Record<string, any>
  pager?: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface AnalyticsUser {
  id: number
  name: string
  mwUserId: number
  siteId: number
  createdAt: number
  updatedAt: number
}

export interface AnalyticsSite {
  id: number
  name: string
  apiUrl: string
  articlePath: string
  migratedToId: number | null
  createdAt: number
  updatedAt: number
}

export interface AnalyticsRecentActivityItem {
  id: number
  pageName: string | null
  feature: string
  subtype: string | null
  coreVersion: string | null
  createdAt: number
  user: AnalyticsUser
  site: AnalyticsSite
}

export type AnalyticsRecentActivityResponse = AnalyticsResponse<
  AnalyticsRecentActivityItem[]
>

export type AnalyticsTotalUsageResponse = AnalyticsResponse<{
  total: number
  users: number
  sites: number
}>

export type AnalyticsUserUsageResponse = AnalyticsResponse<{
  user: AnalyticsUser
  site: AnalyticsSite
  total: number
  features: Record<string, number>
}>

export type AnalyticsSiteUsageResponse = AnalyticsResponse<{
  site: AnalyticsSite
  total: number
}>

export interface AnalyticsDailyUsageItem {
  date: string
  count: number
}

export type AnalyticsDailyUsageResponse = AnalyticsResponse<
  AnalyticsDailyUsageItem[]
>
