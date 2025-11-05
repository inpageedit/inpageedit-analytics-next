<template>
  <div class="space-y-8">
    <!-- 页面头部 -->
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <UButton
          to="/"
          icon="i-heroicons-arrow-left"
          color="neutral"
          variant="ghost"
          size="sm"
        >
          返回
        </UButton>
      </div>

      <div class="flex items-start gap-4">
        <div class="shrink-0">
          <div
            class="w-16 h-16 bg-linear-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <UIcon name="i-heroicons-user" class="w-8 h-8 text-white" />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div v-if="loadingUserInfo" class="space-y-2">
            <USkeleton class="h-8 w-64" />
            <USkeleton class="h-5 w-96" />
          </div>
          <div v-else class="space-y-2">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ userName }}
              </h1>
              <a
                :href="mwUserPageUrl"
                target="_blank"
                title="查看用户页面"
                class="text-primary hover:text-primary/80 transition-colors"
              >
                <UIcon
                  name="i-heroicons-arrow-top-right-on-square"
                  class="w-5 h-5"
                />
              </a>
            </div>
            <div
              class="flex items-center gap-2 text-gray-600 dark:text-gray-400"
            >
              <UIcon name="i-heroicons-identification" class="w-4 h-4" />
              <span>MediaWiki 用户 ID: #{{ userMwUserId }}</span>
            </div>
            <RouterLink
              :to="`/site/${userInfo?.data?.site.id}`"
              class="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <UIcon name="i-heroicons-globe-alt" class="w-4 h-4" />
              <span>{{ userInfo?.data?.site.name }}</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard>
        <div v-if="loadingUserInfo">
          <USkeleton class="h-16" />
        </div>
        <div v-else class="space-y-2">
          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-pencil-square" class="w-5 h-5" />
            <span class="text-sm font-medium">编辑次数</span>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ formatNumber(userInfo?.data?.total ?? 0) }}
          </div>
        </div>
      </UCard>

      <UCard>
        <div v-if="loadingUserInfo">
          <USkeleton class="h-16" />
        </div>
        <div v-else class="space-y-2">
          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-finger-print" class="w-5 h-5" />
            <span class="text-sm font-medium">用户 ID</span>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            #{{ userData?.user.id ?? '-' }}
          </div>
        </div>
      </UCard>

      <UCard>
        <div v-if="loadingUserInfo">
          <USkeleton class="h-16" />
        </div>
        <div v-else class="space-y-2">
          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-user-circle" class="w-5 h-5" />
            <span class="text-sm font-medium">MW 用户 ID</span>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            #{{ userMwUserId ?? '-' }}
          </div>
        </div>
      </UCard>
    </div>

    <!-- 用户信息 -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-information-circle"
            class="w-5 h-5 text-gray-500"
          />
          <span class="font-semibold text-gray-900 dark:text-white"
            >用户详细信息</span
          >
        </div>
      </template>

      <div v-if="loadingUserInfo" class="space-y-3">
        <USkeleton class="h-6" />
        <USkeleton class="h-6" />
        <USkeleton class="h-6" />
      </div>
      <div v-else class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <div class="text-sm text-gray-500 dark:text-gray-400">用户名</div>
            <div class="text-gray-900 dark:text-white font-medium">
              {{ userName }}
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-sm text-gray-500 dark:text-gray-400">所属站点</div>
            <RouterLink
              :to="`/site/${userSite?.id}`"
              class="text-primary hover:underline font-medium"
            >
              {{ userSite?.name }}
            </RouterLink>
          </div>
          <div class="space-y-1">
            <div class="text-sm text-gray-500 dark:text-gray-400">用户页面</div>
            <a
              :href="mwUserPageUrl"
              target="_blank"
              class="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>访问用户页面</span>
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="w-3 h-3"
              />
            </a>
          </div>
          <div class="space-y-1">
            <div class="text-sm text-gray-500 dark:text-gray-400">使用统计</div>
            <div class="text-gray-900 dark:text-white font-medium">
              共 {{ formatNumber(userInfo?.data?.total ?? 0) }} 次编辑
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const userId = computed(() => parseInt(String(route.params.userId || '0')))

const { data: userInfo, pending: loadingUserInfo } =
  useFetch<AnalyticsUserUsageResponse>(`/api/v6/usage/user`, {
    query: {
      userId: userId.value,
    },
  })

const userData = computed(() => userInfo.value?.data)
const userName = computed(() => userData.value?.user.name)
const userMwUserId = computed(() => userData.value?.user.mwUserId)
const userSite = computed(() => userData.value?.site)

const mwUserPageUrl = computed(() => {
  const apiUrl = userSite.value?.apiUrl
  const articlePath = userSite.value?.articlePath
  if (!apiUrl || !articlePath) return ''
  return getWikiUrl(apiUrl, articlePath, `User:${userName.value}`)?.href
})

useHead({
  title: () => {
    return userName.value ? `${userName.value}@${userSite.value?.name}` : '用户'
  },
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}
</script>

<style scoped lang="scss"></style>
