<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">
          <template v-if="loadingUserInfo">用户详情</template>
          <template v-else>
            {{ userName }}
            <a :href="mwUserPageUrl" target="_blank" title="查看用户页面">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                class="inline h-6 w-6 middle"
                fill="currentColor"
              >
                <path
                  d="M10.5 2a.5.5 0 0 0 0 1h2.793L8.146 8.146a.5.5 0 0 0 .708.708L14 3.707V6.5a.5.5 0 0 0 1 0v-4A.5.5 0 0 0 14.5 2h-4zm3 5.5a.5.5 0 0 1 .5.5v6A1.5 1.5 0 0 1 12.5 15h-9A1.5 1.5 0 0 1 2 13.5v-9A1.5 1.5 0 0 1 3.5 3H9a.5.5 0 0 1 0 1H3.5A.5.5 0 0 0 3 4.5v9A.5.5 0 0 0 3.5 14h9a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 1 .5-.5z"
                />
              </svg>
            </a>
          </template>
        </h1>
        <p class="text-gray-500">
          <template v-if="loadingUserInfo">载入中……</template>
          <template v-else>
            <RouterLink :to="`/site/${userInfo?.data?.site.id}`">{{
              userInfo?.data?.site.name
            }}</RouterLink>
          </template>
        </p>
      </div>
    </div>

    <div>
      <pre>{{ userInfo }}</pre>
    </div>
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
</script>

<style scoped lang="scss"></style>
