<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <UIcon
          name="i-heroicons-chart-bar-square"
          class="w-8 h-8 text-primary"
        />
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">仪表盘</h1>
      </div>
      <p class="text-gray-600 dark:text-gray-400">
        InPageEdit NEXT 全球使用统计数据
      </p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-cursor-arrow-ripple"
              class="w-5 h-5 text-blue-500"
            />
            <span class="font-semibold text-gray-700 dark:text-gray-300"
              >总使用量</span
            >
          </div>
        </template>
        <div v-if="loadingUsage" class="h-20">
          <USkeleton class="h-full" />
        </div>
        <div v-else class="space-y-2">
          <div class="text-4xl font-bold text-gray-900 dark:text-white">
            {{ formatNumber(totalUsage?.data?.total ?? 0) }}
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">累计编辑次数</p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-user-group"
              class="w-5 h-5 text-green-500"
            />
            <span class="font-semibold text-gray-700 dark:text-gray-300"
              >总用户量</span
            >
          </div>
        </template>
        <div v-if="loadingUsage" class="h-20">
          <USkeleton class="h-full" />
        </div>
        <div v-else class="space-y-2">
          <div class="text-4xl font-bold text-gray-900 dark:text-white">
            {{ formatNumber(totalUsage?.data?.users ?? 0) }}
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">活跃编辑者</p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-globe-alt"
              class="w-5 h-5 text-purple-500"
            />
            <span class="font-semibold text-gray-700 dark:text-gray-300"
              >总站点数</span
            >
          </div>
        </template>
        <div v-if="loadingUsage" class="h-20">
          <USkeleton class="h-full" />
        </div>
        <div v-else class="space-y-2">
          <div class="text-4xl font-bold text-gray-900 dark:text-white">
            {{ formatNumber(totalUsage?.data?.sites ?? 0) }}
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            接入的 Wiki 站点
          </p>
        </div>
      </UCard>
    </div>

    <!-- 最近活动 -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-gray-500" />
            <span class="font-semibold text-gray-900 dark:text-white"
              >最近活动</span
            >
          </div>
          <UBadge color="neutral" variant="subtle" size="sm"> 实时更新 </UBadge>
        </div>
      </template>

      <div v-if="loadingRecent" class="p-6">
        <USkeleton class="h-64" />
      </div>
      <template v-else>
        <div v-if="recentActivity?.data?.length" class="overflow-hidden">
          <UTable
            :data="recentActivity.data"
            :columns="recentActivityColumns"
          />
        </div>
        <div v-else class="p-12 text-center">
          <UIcon
            name="i-heroicons-inbox"
            class="w-16 h-16 mx-auto text-gray-400 mb-3"
          />
          <p class="text-gray-500 dark:text-gray-400">暂无活动数据</p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type {
  AnalyticsTotalUsageResponse,
  AnalyticsRecentActivityResponse,
} from '#shared/types/AnalyticsResponse'
import type { TableColumn } from '@nuxt/ui'
import { RouterLink } from 'vue-router'

useHead({
  title: '',
})

const { data: totalUsage, pending: loadingUsage } =
  useFetch<AnalyticsTotalUsageResponse>('/api/v6/usage/total')
const { data: recentActivity, pending: loadingRecent } =
  useFetch<AnalyticsRecentActivityResponse>('/api/v6/recent')

const recentActivityColumns: TableColumn<AnalyticsRecentActivityItem>[] = [
  {
    header: '用户',
    cell({ row }) {
      return h(
        RouterLink,
        { to: `/user/${row.original.user.id}` },
        () => `${row.original.user.name} (#${row.original.user.mwUserId})`
      )
    },
  },
  {
    header: '站点',
    cell({ row }) {
      return h(
        RouterLink,
        { to: `/site/${row.original.site.id}` },
        () =>
          `${row.original.site.name} (${
            new URL(row.original.site.apiUrl).host
          })`
      )
    },
  },
  {
    header: '功能',
    cell({ row }) {
      return `${row.original.feature}${
        row.original.subtype ? `/${row.original.subtype}` : ''
      }`
    },
  },
  {
    header: '版本',
    cell({ row }) {
      return row.original.coreVersion ?? '-'
    },
  },
  {
    header: '时间',
    cell({ row }) {
      return formatTs(row.original.createdAt)
    },
  },
]

const formatDate = new Intl.DateTimeFormat(/** auto */ undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format
const formatTs = (ts: number) => formatDate(new Date(ts * 1000))

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}
</script>

<style scoped lang="scss"></style>
