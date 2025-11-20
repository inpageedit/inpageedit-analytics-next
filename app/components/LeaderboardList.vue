<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-trophy" class="w-5 h-5 text-amber-500" />
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ title }}
          </span>
        </div>
        <UBadge v-if="!pending" color="primary" variant="subtle">
          共 {{ items?.length || 0 }} {{ unit }}
        </UBadge>
      </div>
    </template>

    <!-- 加载中 -->
    <div v-if="pending" class="space-y-4">
      <USkeleton v-for="i in 10" :key="i" class="h-16" />
    </div>

    <!-- 排行榜列表 -->
    <div v-else-if="items?.length" class="space-y-2">
      <div
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        class="flex items-center gap-4 p-4 rounded-lg transition-all relative overflow-hidden"
        :class="getItemClasses(index)"
      >
        <!-- 闪亮动画背景 -->
        <div
          v-if="index < 3"
          class="absolute inset-0 animate-shimmer"
          :class="{
            'opacity-60 dark:opacity-30 bg-linear-to-r from-transparent via-amber-400/80 dark:via-white to-transparent':
              index === 0,
            'opacity-50 dark:opacity-25 bg-linear-to-r from-transparent via-gray-400/70 dark:via-white/90 to-transparent':
              index === 1,
            'opacity-60 dark:opacity-30 bg-linear-to-r from-transparent via-orange-400/80 dark:via-white to-transparent':
              index === 2,
          }"
        ></div>

        <!-- 排名和图标 -->
        <div
          class="flex items-center justify-center w-12 shrink-0 relative z-10"
        >
          <UIcon
            v-if="index === 0"
            name="i-heroicons-trophy"
            class="w-8 h-8 text-amber-500 dark:text-amber-400 drop-shadow-lg"
            title="金牌"
          />
          <UIcon
            v-else-if="index === 1"
            name="i-heroicons-star-solid"
            class="w-8 h-8 text-gray-500 dark:text-gray-400 drop-shadow-lg"
            title="银牌"
          />
          <UIcon
            v-else-if="index === 2"
            name="i-heroicons-star-solid"
            class="w-8 h-8 text-orange-500 dark:text-orange-400 drop-shadow-lg"
            title="铜牌"
          />
          <span
            v-else
            class="text-2xl font-bold text-gray-400 dark:text-gray-600"
          >
            {{ index + 1 }}
          </span>
        </div>

        <!-- 主要内容区域 -->
        <div class="flex-1 min-w-0 relative z-10">
          <slot name="item-content" :item="item" :index="index">
            <!-- 默认内容 -->
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ getItemName(item) }}
            </div>
          </slot>
        </div>

        <!-- 使用次数 -->
        <div class="text-right shrink-0 relative z-10">
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
    <template v-if="hasMore" #footer>
      <div class="flex justify-center">
        <UButton
          color="primary"
          variant="soft"
          @click="$emit('load-more')"
          :loading="loadingMore"
        >
          加载更多
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script
  setup
  lang="ts"
  generic="T extends AnalyticsLeaderboardSiteItem | AnalyticsLeaderboardUserItem"
>
import type {
  AnalyticsLeaderboardSiteItem,
  AnalyticsLeaderboardUserItem,
} from '#shared/types/AnalyticsResponse'

interface Props<T = any> {
  items: T[] | undefined
  pending: boolean
  title: string
  unit: string
  hasMore?: boolean
  loadingMore?: boolean
  getItemKey?: (item: T, index: number) => string | number
  getItemName?: (item: T) => string
}

const props = withDefaults(defineProps<Props>(), {
  hasMore: false,
  loadingMore: false,
  getItemKey: (item: T, index: number) => {
    if ('siteId' in item) return item.siteId
    if ('userId' in item) return item.userId
    return index
  },
  getItemName: (item: T) => {
    if ('site' in item && item.site) return item.site.name
    if ('user' in item && item.user) return item.user.name
    if ('siteId' in item) return `站点 #${item.siteId}`
    if ('userId' in item) return `用户 #${item.userId}`
    return '未知'
  },
})

defineEmits<{
  'load-more': []
}>()

// 格式化数字
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// 获取列表项样式类
const getItemClasses = (index: number) => {
  if (index === 0) {
    return 'bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 dark:from-amber-900/40 dark:via-yellow-900/30 dark:to-amber-900/40 border-2 border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 hover:shadow-xl hover:shadow-amber-300/50 dark:hover:shadow-amber-800/40'
  }
  if (index === 1) {
    return 'bg-gradient-to-r from-gray-100 via-slate-100 to-gray-100 dark:from-gray-800/50 dark:via-slate-800/40 dark:to-gray-800/50 border-2 border-gray-300 dark:border-gray-600 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30 hover:shadow-xl hover:shadow-gray-300/50 dark:hover:shadow-gray-700/40'
  }
  if (index === 2) {
    return 'bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 dark:from-orange-900/40 dark:via-amber-900/30 dark:to-orange-900/40 border-2 border-orange-400 dark:border-orange-500 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 hover:shadow-xl hover:shadow-orange-300/50 dark:hover:shadow-orange-800/40'
  }
  return 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
}
</script>
