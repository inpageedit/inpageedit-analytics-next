<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">仪表盘</h1>
        <p class="text-gray-500">InPageEdit NEXT 使用统计</p>
      </div>
      <!-- <UButton color="primary">开始</UButton> -->
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard>
        <template #header>总使用量</template>
        <div v-if="loadingUsage">
          <USkeleton class="h-24" />
        </div>
        <div v-else class="h-24 flex items-center justify-center">
          <div class="text-4xl font-bold">
            {{ totalUsage?.data?.total ?? 0 }}
          </div>
        </div>
      </UCard>
      <UCard>
        <template #header>总用户量</template>
        <div v-if="loadingUsage">
          <USkeleton class="h-24" />
        </div>
        <div v-else class="h-24 flex items-center justify-center">
          <div class="text-4xl font-bold">
            {{ totalUsage?.data?.users ?? 0 }}
          </div>
        </div>
      </UCard>
      <UCard>
        <template #header>总站点数</template>
        <div v-if="loadingUsage">
          <USkeleton class="h-24" />
        </div>
        <div v-else class="h-24 flex items-center justify-center">
          <div class="text-4xl font-bold">
            {{ totalUsage?.data?.sites ?? 0 }}
          </div>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>最近活动</template>
      <div v-if="loadingRecent">
        <USkeleton class="h-40" />
      </div>
      <template v-else>
        <div v-if="recentActivity?.data?.length">
          <UTable
            :data="recentActivity.data"
            sticky
            class="flex-1 h-[50vh]"
            :columns="recentActivityColumns"
          ></UTable>
        </div>
        <div v-else class="text-gray-500">暂无数据</div>
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
</script>

<style scoped lang="scss"></style>
