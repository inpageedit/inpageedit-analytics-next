export interface IPEBeaconPayload {
  siteApi: string
  siteName?: string
  userName: string
  userId: number
  version?: string
  usages: {
    ts: number
    feature: string
    subtype?: string
    page?: string
  }[]
}
