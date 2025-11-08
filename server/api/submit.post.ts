export default eventHandler(async (event) => {
  setHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  })
  return Response.json({
    error: true,
    message: 'API v5 is deprecated, please use API v6 instead.',
  })
})
