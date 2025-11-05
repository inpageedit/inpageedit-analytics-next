export default eventHandler(async (event) => {
  const body = await readBody(event)
  console.log(body)
  return Response.json({
    error: true,
    message: 'API v5 is deprecated, please use API v6 instead.',
  })
})
