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
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-trophy" class="w-5 h-5 text-amber-500" />
            <span class="font-semibold text-gray-900 dark:text-white">
              用户活跃排名
            </span>
          </div>
          <UBadge v-if="!pending" color="primary" variant="subtle">
            共 {{ leaderboard?.data?.length || 0 }} 位用户
          </UBadge>
        </div>
      </template>

      <!-- 加载中 -->
      <div v-if="pending" class="space-y-4">
        <USkeleton v-for="i in 10" :key="i" class="h-16" />
      </div>

      <!-- 排行榜列表 -->
      <div v-else-if="leaderboard?.data?.length" class="space-y-2">
        <div
          v-for="(item, index) in leaderboard.data"
          :key="item.userId"
          class="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          :class="{
            'bg-amber-50 dark:bg-amber-950/20': index === 0,
            'bg-gray-50 dark:bg-gray-800/30': index === 1,
            'bg-orange-50 dark:bg-orange-950/20': index === 2,
          }"
        >
          <!-- 排名和皇冠 -->
          <div class="flex items-center justify-center w-12 shrink-0">
            <UIcon
              v-if="index === 0"
              name="i-heroicons-star-solid"
              class="w-8 h-8 text-amber-400"
              title="金牌"
            />
            <UIcon
              v-else-if="index === 1"
              name="i-heroicons-star-solid"
              class="w-8 h-8 text-gray-400"
              title="银牌"
            />
            <UIcon
              v-else-if="index === 2"
              name="i-heroicons-star-solid"
              class="w-8 h-8 text-orange-400"
              title="铜牌"
            />
            <span
              v-else
              class="text-2xl font-bold text-gray-400 dark:text-gray-600"
            >
              {{ index + 1 }}
            </span>
          </div>

          <!-- 用户信息 -->
          <div class="flex-1 min-w-0">
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
          </div>

          <!-- 使用次数 -->
          <div class="text-right shrink-0">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatNumber(item.count) }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">次使用</div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <UIcon
          name="i-heroicons-inbox"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4"
        />
        <p class="text-gray-500 dark:text-gray-400">暂无数据</p>
      </div>

      <!-- 分页 -->
      <template v-if="leaderboard?.pager?.hasMore" #footer>
        <div class="flex justify-center">
          <UButton
            color="primary"
            variant="soft"
            @click="loadMore"
            :loading="loadingMore"
          >
            加载更多
          </UButton>
        </div>
      </template>
    </UCard>

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
            name="i-heroicons-star-solid"
            class="w-4 h-4 inline text-amber-400"
          />
          金牌、<UIcon
            name="i-heroicons-star-solid"
            class="w-4 h-4 inline text-gray-400"
          />
          银牌、<UIcon
            name="i-heroicons-star-solid"
            class="w-4 h-4 inline text-orange-400"
          />
          铜牌分别授予前三名
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { AnalyticsLeaderboardUserResponse } from '#shared/types/AnalyticsResponse'

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
