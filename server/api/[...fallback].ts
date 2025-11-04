export default eventHandler((event) => {
  return Response.json(
    {
      error: true,
      statusText: 'Not Found',
    },
    { status: 404 }
  )
})
