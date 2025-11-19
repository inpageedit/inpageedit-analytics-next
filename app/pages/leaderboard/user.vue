<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <div class="space-y-3">
      <!-- 面包屑导航 -->
      <UBreadcrumb :items="breadcrumbItems" />

      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-user-group" class="w-8 h-8 text-green-500" />
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            用户排行榜
          </h1>
        </div>
        <p class="text-gray-600 dark:text-gray-400">
          统计时间段：{{ formatDate(startTime) }} - {{ formatDate(endTime) }}
          <span class="text-sm text-gray-500 dark:text-gray-500"
            >（最近 30 天）</span
          >
        </p>
      </div>
    </div>

    <!-- 排行榜卡片 -->
    <LeaderboardList
      :items="leaderboard?.data as AnalyticsLeaderboardUserItem[] | undefined"
      :pending="pending"
      title="用户活跃排名"
      unit="位用户"
      :has-more="leaderboard?.pager?.hasMore"
      :loading-more="loadingMore"
      @load-more="loadMore"
    >
      <template
        #item-content="{ item }: { item: AnalyticsLeaderboardUserItem }"
      >
        <NuxtLink
          :to="`/user/${item.userId}`"
          class="group flex items-center gap-2"
        >
          <h3
            class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate"
          >
            {{ item.user?.name || `用户 #${item.userId}` }}
          </h3>
          <UIcon
            name="i-heroicons-arrow-top-right-on-square"
            class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          />
        </NuxtLink>
        <div class="flex items-center gap-2 mt-1">
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
            来自
            <NuxtLink
              v-if="item.site"
              :to="`/site/${item.site.id}`"
              class="hover:text-primary transition-colors"
            >
              {{ item.site.name }}
            </NuxtLink>
            <span v-else>未知站点</span>
          </p>
        </div>
      </template>
    </LeaderboardList>

    <!-- 说明信息 -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-information-circle"
            class="w-5 h-5 text-blue-500"
          />
          <span class="font-semibold text-gray-900 dark:text-white">
            说明
          </span>
        </div>
      </template>
      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          • 统计时间范围为最近 30 天（{{ formatDate(startTime) }} 至
          {{ formatDate(endTime) }}）
        </p>
        <p>• 按用户使用 InPageEdit 的总次数排序</p>
        <p>• 点击用户名称可查看该用户的详细统计信息</p>
        <p>
          •
          <UIcon
            name="i-heroicons-trophy"
            class="w-4 h-4 inline text-amber-500"
          />
          金牌、<UIcon
            name="i-heroicons-star-solid"
            class="w-4 h-4 inline text-gray-500"
          />
          银牌、<UIcon
            name="i-heroicons-star-solid"
            class="w-4 h-4 inline text-orange-500"
          />
          铜牌分别授予前三名
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type {
  AnalyticsLeaderboardUserResponse,
  AnalyticsLeaderboardUserItem,
} from '#shared/types/AnalyticsResponse'

useHead({
  title: '用户排行榜',
})

// 计算最近30天的时间范围
const now = Date.now()
const endTime = now
const startTime = now - 30 * 24 * 60 * 60 * 1000 // 30天前
const startTimestamp = Math.floor(startTime / 1000)
const endTimestamp = Math.floor(endTime / 1000)

// 获取排行榜数据
const limit = ref(50)
const offset = ref(0)
const loadingMore = ref(false)

const {
  data: leaderboard,
  pending,
  refresh,
} = await useFetch<AnalyticsLeaderboardUserResponse>(
  '/api/v6/leaderboard/user',
  {
    query: {
      start: startTimestamp,
      end: endTimestamp,
      limit: limit.value,
      offset: offset.value,
    },
  }
)

// 格式化数字
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// 格式化日期
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 加载更多
const loadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  offset.value += limit.value
  await refresh()
  loadingMore.value = false
}

// 面包屑导航
const breadcrumbItems = [
  {
    label: '首页',
    to: '/',
    icon: 'i-heroicons-home',
  },
  {
    label: '排行榜',
    to: '/leaderboard',
    icon: 'i-heroicons-trophy',
  },
  {
    label: '用户排行榜',
    to: '#',
    icon: 'i-heroicons-user-group',
  },
]
</script>
