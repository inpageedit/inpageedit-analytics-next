import { ZodError } from 'zod'
import { IPEBeaconPayload } from '#shared/types/index.js'

export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, beaconSchema.safeParse)

  if (body.error || !body.data) {
    return Response.json(
      {
        error: true,
        code: 'InvalidPayload',
        statusMessage: 'Invalid payload',
        cause: body.error ? body.error.issues : undefined,
      },
      { status: 400 }
    )
  }

  const payload = body.data!

  const siteApi = payload.siteApi
  const userName = payload.userName
  const userId = payload.userId
  const usages = payload.usages

  // All usages must be within the last hour
  const mustBefore = Date.now()
  const mustAfter = mustBefore - 1000 * 60 * 60
  for (const usage of usages) {
    if (usage.ts > mustBefore || usage.ts < mustAfter) {
      return Response.json(
        {
          error: true,
          code: 'InvalidTimestamp',
          statusMessage: 'Timestamp is invalid',
        },
        { status: 400 }
      )
    }
  }

  if (!siteApi || !userName || !userId) {
    return Response.json(
      {
        error: true,
        code: 'MissingRequiredFields',
        statusMessage: 'Missing required fields',
      },
      { status: 400 }
    )
  }

  if (!usages.length) {
    return Response.json(
      {
        success: true,
        message: 'No usages provided',
        meta: {
          changes: 0,
          eventId: null,
        },
      },
      { status: 200 }
    )
  }

  const wikiSite = await getWikiSiteFromDB(event, siteApi)
  const wikiUser = await getWikiUserFromDB(event, wikiSite.id, userId, userName)

  const result = await logUsages(event, wikiSite.id, wikiUser.id, usages)
  return Response.json({
    success: true,
    message: 'Usages logged successfully',
    meta: {
      changes: result.length,
      eventId: result.meta?.last_row_id ?? null,
    },
  })
})
