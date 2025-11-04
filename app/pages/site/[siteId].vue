<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">
          {{ loadingSiteInfo ? '站点详情' : siteInfo?.data?.site.name }}
        </h1>
        <p class="text-gray-500">
          <!-- {{ loadingSiteInfo ? '载入中……' : siteInfo?.data?.site.apiUrl }} -->
          <template v-if="loadingSiteInfo">载入中……</template>
          <template v-else>
            <a :href="siteMainpageUrl" target="_blank">
              {{ siteMainpageUrl }}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                class="inline h-4 w-4 middle"
                fill="currentColor"
              >
                <path
                  d="M10.5 2a.5.5 0 0 0 0 1h2.793L8.146 8.146a.5.5 0 0 0 .708.708L14 3.707V6.5a.5.5 0 0 0 1 0v-4A.5.5 0 0 0 14.5 2h-4zm3 5.5a.5.5 0 0 1 .5.5v6A1.5 1.5 0 0 1 12.5 15h-9A1.5 1.5 0 0 1 2 13.5v-9A1.5 1.5 0 0 1 3.5 3H9a.5.5 0 0 1 0 1H3.5A.5.5 0 0 0 3 4.5v9A.5.5 0 0 0 3.5 14h9a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 1 .5-.5z"
                />
              </svg>
            </a>
          </template>
        </p>
      </div>
    </div>

    <div>
      <pre>{{ siteInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const siteId = computed(() => parseInt(String(route.params.siteId || '0')))

const { data: siteInfo, pending: loadingSiteInfo } =
  useFetch<AnalyticsSiteUsageResponse>(`/api/v6/usage/site`, {
    query: {
      siteId: siteId.value,
    },
  })

const siteMainpageUrl = computed(() => {
  const apiUrl = siteInfo.value?.data?.site.apiUrl
  const articlePath = siteInfo.value?.data?.site.articlePath
  if (!apiUrl || !articlePath) return ''
  return getWikiUrl(apiUrl, articlePath)?.href
})
</script>

<style scoped lang="scss"></style>
