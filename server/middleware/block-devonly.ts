import process from 'node:process'

export default eventHandler((event) => {
  const path = event.path
  if (path.includes('/_dev/') && IS_PROD) {
    return Response.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }
})
