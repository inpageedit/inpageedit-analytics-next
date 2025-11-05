<template>
  <div class="space-y-8">
    <!-- 页面头部 -->
    <div class="space-y-3">
      <!-- 面包屑导航 -->
      <UBreadcrumb :items="breadcrumbItems" />

      <div class="flex items-start gap-4">
        <div class="shrink-0">
          <div
            class="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <UIcon name="i-heroicons-globe-alt" class="w-8 h-8 text-white" />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div v-if="loadingSiteInfo" class="space-y-2">
            <USkeleton class="h-8 w-64" />
            <USkeleton class="h-5 w-96" />
          </div>
          <div v-else class="space-y-2">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ siteInfo?.data?.site.name }}
            </h1>
            <a
              :href="siteMainpageUrl"
              target="_blank"
              class="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <span>{{ siteHost }}</span>
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="w-4 h-4"
              />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard>
        <div v-if="loadingSiteInfo">
          <USkeleton class="h-16" />
        </div>
        <div v-else class="space-y-2">
          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-cursor-arrow-ripple" class="w-5 h-5" />
            <span class="text-sm font-medium">总使用次数</span>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ formatNumber(total ?? 0) }}
          </div>
        </div>
      </UCard>

      <UCard>
        <div v-if="loadingSiteInfo">
          <USkeleton class="h-16" />
        </div>
        <div v-else class="space-y-2">
          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-code-bracket" class="w-5 h-5" />
            <span class="text-sm font-medium">站点 ID</span>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            #{{ site?.id ?? '-' }}
          </div>
        </div>
      </UCard>

      <UCard>
        <div v-if="loadingSiteInfo">
          <USkeleton class="h-16" />
        </div>
        <div v-else class="space-y-2">
          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-server" class="w-5 h-5" />
            <span class="text-sm font-medium">引擎类型</span>
          </div>
          <div class="text-xl font-semibold text-gray-900 dark:text-white">
            MediaWiki
          </div>
        </div>
      </UCard>
    </div>

    <!-- 站点信息 -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-information-circle"
            class="w-5 h-5 text-gray-500"
          />
          <span class="font-semibold text-gray-900 dark:text-white"
            >站点详细信息</span
          >
        </div>
      </template>

      <div v-if="loadingSiteInfo" class="space-y-3">
        <USkeleton class="h-6" />
        <USkeleton class="h-6" />
        <USkeleton class="h-6" />
      </div>
      <div v-else class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <div class="text-sm text-gray-500 dark:text-gray-400">API 地址</div>
            <div
              class="text-gray-900 dark:text-white font-mono text-sm break-all"
            >
              {{ siteApiUrl }}
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-sm text-gray-500 dark:text-gray-400">文章路径</div>
            <div class="text-gray-900 dark:text-white font-mono text-sm">
              {{ siteArticlePath || '-' }}
            </div>
          </div>
        </div>
      </div>
    </UCard>
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

const site = computed(() => siteInfo.value?.data?.site)
const siteName = computed(() => site.value?.name)
const siteApiUrl = computed(() => site.value?.apiUrl)
const siteArticlePath = computed(() => site.value?.articlePath)
const total = computed(() => siteInfo.value?.data?.total)

const getUrl = (title: string) => {
  if (!siteApiUrl.value || !siteArticlePath.value) return ''
  return getWikiUrl(siteApiUrl.value, siteArticlePath.value, title)?.href
}

const siteMainpageUrl = computed(() => getUrl(''))
const siteHost = computed(() =>
  siteMainpageUrl.value ? new URL(siteMainpageUrl.value).host : ''
)

useHead({
  title: () =>
    siteName.value ? `${siteName.value} (${siteHost.value})` : '站点详情',
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const breadcrumbItems = computed(() => [
  {
    label: '首页',
    to: '/',
    icon: 'i-heroicons-home',
  },
  {
    label: loadingSiteInfo.value ? '站点详情' : siteName.value || '站点',
    to: '#',
    icon: 'i-heroicons-globe-alt',
  },
])
</script>

<style scoped lang="scss"></style>
