export default eventHandler(async (event) => {
  const KV = useKV(event)
  let count = parseInt((await KV.get('count')) || '0') || 0
  count++
  await KV.put('count', count.toString())

  const D1 = useD1(event)
  const result = await D1.prepare(
    'SELECT tbl_name FROM sqlite_master WHERE type = "table"'
  ).all()

  return Response.json({
    tables: result.results.map((row) => row.tbl_name),
    count,
  })
})
