export const getWikiUrl = (
  baseUrl: string,
  articlePath: string,
  title: string = ''
) => {
  if (!baseUrl || !articlePath) {
    return undefined
  }
  return new URL(articlePath.replace('$1', title), baseUrl)
}
