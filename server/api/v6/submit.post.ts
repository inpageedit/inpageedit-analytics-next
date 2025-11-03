import { ZodError } from 'zod'
import { IPEBeaconPayload } from '#shared/types/index.js'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  let payload: IPEBeaconPayload
  try {
    payload = beaconSchema.parse(body)
  } catch (e) {
    if (e instanceof ZodError) {
      return Response.json(
        {
          error: true,
          code: 'InvalidPayload',
          statusMessage: 'Zod validation error',
          issues: e.issues,
        },
        { status: 400 }
      )
    }
    return Response.json(
      {
        error: true,
        code: 'InvalidPayload',
        statusMessage: 'Invalid payload',
        cause: e,
      },
      { status: 400 }
    )
  }

  const siteApi = payload.siteApi
  const userName = payload.userName
  const userId = payload.userId
  const usages = payload.usages

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
        error: true,
        code: 'NoUsagesProvided',
        statusMessage: 'No usages provided',
      },
      { status: 400 }
    )
  }

  const wikiSite = await getWikiSiteFromDB(event, siteApi)
  const wikiUser = await getWikiUserFromDB(event, wikiSite.id, userId, userName)

  const result = await logUsages(event, wikiSite.id, wikiUser.id, usages)
  return Response.json(result)
})
