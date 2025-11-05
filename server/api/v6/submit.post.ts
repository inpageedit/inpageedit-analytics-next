import { IPEBeaconPayload } from '~~/shared/types'

export default eventHandler(async (event) => {
  let body = await readBody<IPEBeaconPayload>(event)
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body) as IPEBeaconPayload
    } catch (error) {
      return Response.json(
        {
          error: true,
          code: 'InvalidPayload',
          statusMessage: 'Invalid payload',
        },
        { status: 400 }
      )
    }
  }

  const { data, error } = beaconSchema.safeParse(body)

  if (error || !data) {
    return Response.json(
      {
        error: true,
        code: 'ZodError',
        statusMessage: 'Validation error',
        cause: error ? error.issues : undefined,
      },
      { status: 400 }
    )
  }

  const siteApi = data.siteApi
  const userName = data.userName
  const mwUserId = data.userId
  const coreVersion = data.version
  const usages = data.usages

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

  if (!siteApi || !userName || !mwUserId) {
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
        data: {
          changes: 0,
          eventId: null,
        },
      },
      { status: 200 }
    )
  }

  const wikiSite = await getWikiSiteFromDB(event, siteApi)
  const wikiUser = await getWikiUserFromDB(
    event,
    wikiSite.id,
    mwUserId,
    userName
  )

  const result = await logUsages(event, {
    siteId: wikiSite.id,
    userId: wikiUser.id,
    coreVersion,
    usages,
  })
  return Response.json({
    data: {
      changes: result.length,
      eventId: result.meta?.last_row_id ?? null,
    },
  })
})
