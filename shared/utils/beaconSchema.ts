import z from 'zod'
import type { IPEBeaconPayload } from '#shared/types/index.js'

/**
 * Valid version formats:
 * 1.2.3
 * 1.2.3-dev.4
 * 1.2.3-alpha.4
 * 1.2.3-beta.4
 * 1.2.3-rc.4
 * 1.2.3-fix.4
 */
const VERSION_REGEXP = /^\d+\.\d+\.\d+(?:-(?:dev|alpha|beta|rc|fix)\.\d+)?$/

export const beaconSchema: z.ZodType<IPEBeaconPayload> = z.object({
  siteApi: z.string(),
  siteName: z.string().optional(),
  userName: z.string(),
  userId: z.number(),
  version: z
    .string()
    .optional()
    .transform((v) =>
      v ? (v.match(VERSION_REGEXP) ? v : undefined) : undefined
    ),
  usages: z.array(
    z.object({
      ts: z.number(),
      feature: z.string(),
      subtype: z.string().optional(),
      page: z.string().optional(),
    })
  ),
})
