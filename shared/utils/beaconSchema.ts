import z from 'zod'
import type { IPEBeaconPayload } from '#shared/types/index.js'

export const beaconSchema: z.ZodType<IPEBeaconPayload> = z.object({
  siteApi: z.string(),
  userName: z.string(),
  userId: z.number(),
  usages: z.array(
    z.object({
      ts: z.number(),
      feature: z.string(),
      subtype: z.string().optional(),
      page: z.string().optional(),
    })
  ),
})
