export default eventHandler((event) => {
  if (event.path === '/api/v6/submit') {
    setHeaders(event, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    })
  }
})
