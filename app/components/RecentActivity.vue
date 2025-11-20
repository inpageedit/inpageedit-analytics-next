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
        <UButton
          color="primary"
          variant="soft"
          size="sm"
          :disabled="isCooldown"
          :loading="isRefreshing"
          @click="handleRefresh"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
          <span v-if="!isCooldown">刷新</span>
          <span v-else>({{ cooldownSeconds }}s)</span>
        </UButton>
      </div>
    </template>

    <!-- 初始加载状态 -->
    <div v-if="pending && !data?.data?.length" class="p-6">
      <USkeleton class="h-64" />
    </div>
    <!-- 数据内容（带刷新覆盖层） -->
    <template v-else>
      <div v-if="data?.data?.length" class="overflow-hidden relative">
        <UTable :data="data.data" :columns="columns" />
        <!-- 刷新覆盖层 -->
        <div
          v-if="isRefreshing"
          class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <div class="flex flex-col items-center gap-2">
            <UIcon
              name="i-heroicons-arrow-path"
              class="w-6 h-6 text-primary animate-spin"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">刷新中...</span>
          </div>
        </div>
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
const { data, pending, refresh } = useFetch<AnalyticsRecentActivityResponse>(
  '/api/v6/usage/recent',
  {
    query: queryParams,
  }
)

// 冷却时间状态
const isCooldown = ref(false)
const cooldownSeconds = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

// 刷新状态（用于覆盖层）
const isRefreshing = ref(false)

// 处理刷新
const handleRefresh = async () => {
  if (isCooldown.value || isRefreshing.value) return

  // 开始刷新
  isRefreshing.value = true

  try {
    // 执行刷新
    await refresh()
  } finally {
    // 刷新完成
    isRefreshing.value = false

    // 开始冷却
    isCooldown.value = true
    cooldownSeconds.value = 3

    // 清理之前的定时器
    if (cooldownTimer) {
      clearInterval(cooldownTimer)
    }

    // 倒计时
    cooldownTimer = setInterval(() => {
      cooldownSeconds.value--
      if (cooldownSeconds.value <= 0) {
        isCooldown.value = false
        if (cooldownTimer) {
          clearInterval(cooldownTimer)
          cooldownTimer = null
        }
      }
    }, 1000)
  }
}

// 清理定时器
onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})

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
