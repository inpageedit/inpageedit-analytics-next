export default eventHandler((event) => {
  const DEV = process.env.NODE_ENV === 'development'
  const path = event.path
  if (path.includes('/_dev/') && !DEV) {
    return Response.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }
})
