import { IPEBeaconPayload } from '~~/shared/types'
import {
  checkWikiTitle,
  checkUserName,
  normalizeWikiTitle,
} from '~~/shared/utils/wikiTitle'

const WIKI_API_REGEXP = /^https?:\/\/[^\/]+\/.*api\.php$/

const checkWikiApi = (api: string, referer: string | null) => {
  if (!api.match(WIKI_API_REGEXP)) {
    return false
  }
  if (referer && !api.startsWith(referer)) {
    return false
  }
  return true
}

export default eventHandler(async (event) => {
  setHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  })

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
        code: 'InvalidPayload',
        statusMessage: 'Validation error',
        cause: error ? error.issues : undefined,
      },
      { status: 400 }
    )
  }

  const siteApi = data.siteApi
  const siteName = data.siteName
  const mwUserId = data.userId
  const userName = normalizeWikiTitle(data.userName)
  const coreVersion = data.version
  const usages = data.usages

  if (!checkWikiApi(siteApi, event.headers.get('referer'))) {
    return Response.json(
      {
        error: true,
        code: 'InvalidPayload',
        statusMessage: 'Invalid site API URL.',
      },
      { status: 400 }
    )
  }

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

  if (userName && !checkUserName(userName)) {
    return Response.json(
      {
        error: true,
        code: 'InvalidPayload',
        statusMessage: 'Invalid username',
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

  for (const usage of usages) {
    if (usage.page) {
      usage.page = normalizeWikiTitle(usage.page)
    }
    if (usage.page && !checkWikiTitle(usage.page)) {
      return Response.json(
        {
          error: true,
          code: 'InvalidPayload',
          statusMessage: 'Invalid page title',
        },
        { status: 400 }
      )
    }
  }

  const wikiSite = await ensureWikiSiteByPayload(event, siteApi, siteName)
  const wikiUser = await ensureWikiUserByPayload(
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
