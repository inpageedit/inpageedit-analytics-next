export interface IPEBeaconPayload {
  siteApi: string
  userName: string
  userId: number
  usages: {
    ts: number
    feature: string
    subtype?: string
    page?: string
  }[]
}
