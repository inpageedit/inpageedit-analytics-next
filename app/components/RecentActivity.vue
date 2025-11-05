<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-clock" class="w-5 h-5 text-gray-500" />
          <span class="font-semibold text-gray-900 dark:text-white">
            最近活动
          </span>
        </div>
        <UBadge color="neutral" variant="subtle" size="sm"> 实时更新 </UBadge>
      </div>
    </template>

    <div v-if="pending" class="p-6">
      <USkeleton class="h-64" />
    </div>
    <template v-else>
      <div v-if="data?.data?.length" class="overflow-hidden">
        <UTable :data="data.data" :columns="columns" />
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
</template>

<script setup lang="ts">
import type {
  AnalyticsRecentActivityResponse,
  AnalyticsRecentActivityItem,
} from '#shared/types/AnalyticsResponse'
import type { TableColumn } from '@nuxt/ui'
import { RouterLink } from 'vue-router'

interface Props {
  siteId?: number
  userId?: number
  limit?: number
  showSite?: boolean
  showUser?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  siteId: undefined,
  userId: undefined,
  limit: 10,
  showSite: true,
  showUser: true,
})

// 构建查询参数
const queryParams = computed(() => {
  const params: Record<string, any> = {
    limit: props.limit,
  }
  if (props.siteId) {
    params.siteId = props.siteId
  }
  if (props.userId) {
    params.userId = props.userId
  }
  return params
})

// 获取数据
const { data, pending } = useFetch<AnalyticsRecentActivityResponse>(
  '/api/v6/usage/recent',
  {
    query: queryParams,
  }
)

// 格式化时间
const formatDate = new Intl.DateTimeFormat(/** auto */ undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format
const formatTs = (ts: number) => formatDate(new Date(ts * 1000))

// 定义表格列
const columns = computed<TableColumn<AnalyticsRecentActivityItem>[]>(() => {
  const cols: TableColumn<AnalyticsRecentActivityItem>[] = []

  // 用户列（可选）
  if (props.showUser) {
    cols.push({
      header: '用户',
      cell({ row }) {
        return h(
          RouterLink,
          { to: `/user/${row.original.user.id}` },
          () => `${row.original.user.name} (#${row.original.user.mwUserId})`
        )
      },
    })
  }

  // 站点列（可选）
  if (props.showSite) {
    cols.push({
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
    })
  }

  // 功能列（始终显示）
  cols.push({
    header: '功能',
    cell({ row }) {
      return `${row.original.feature}${
        row.original.subtype ? `/${row.original.subtype}` : ''
      }`
    },
  })

  // 版本列（始终显示）
  cols.push({
    header: '版本',
    cell({ row }) {
      return row.original.coreVersion ?? '-'
    },
  })

  // 时间列（始终显示）
  cols.push({
    header: '时间',
    cell({ row }) {
      return formatTs(row.original.createdAt)
    },
  })

  return cols
})
</script>

<style scoped lang="scss"></style>
