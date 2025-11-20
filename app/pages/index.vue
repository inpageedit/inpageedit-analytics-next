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
          <p class="text-sm text-gray-500 dark:text-gray-400">累计使用次数</p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <NuxtLink
            to="/leaderboard/site"
            class="flex items-center justify-between group hover:opacity-80 transition-opacity"
          >
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-globe-alt"
                class="w-5 h-5 text-purple-500"
              />
              <span class="font-semibold text-gray-700 dark:text-gray-300"
                >总站点数</span
              >
            </div>
            <UIcon
              name="i-heroicons-arrow-right"
              class="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors"
            />
          </NuxtLink>
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

      <UCard>
        <template #header>
          <NuxtLink
            to="/leaderboard/user"
            class="flex items-center justify-between group hover:opacity-80 transition-opacity"
          >
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-user-group"
                class="w-5 h-5 text-green-500"
              />
              <span class="font-semibold text-gray-700 dark:text-gray-300"
                >总用户量</span
              >
            </div>
            <UIcon
              name="i-heroicons-arrow-right"
              class="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors"
            />
          </NuxtLink>
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
    </div>

    <!-- 使用量趋势图 -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-presentation-chart-line" class="w-5 h-5 text-gray-500" />
          <span class="font-semibold text-gray-900 dark:text-white"
            >使用量趋势</span
          >
        </div>
      </template>

      <div v-if="loadingDaily" class="p-6">
        <USkeleton class="h-64" />
      </div>
      <div v-else class="p-4">
        <div ref="chartContainer" style="width: 100%; height: 350px"></div>
      </div>
    </UCard>

    <!-- 最近活动 -->
    <RecentActivity :limit="20" />
  </div>
</template>

<script setup lang="ts">
import type {
  AnalyticsTotalUsageResponse,
  AnalyticsDailyUsageResponse,
} from '#shared/types/AnalyticsResponse'
import * as echarts from 'echarts'

useHead({
  title: '',
})

const { data: totalUsage, pending: loadingUsage } =
  useFetch<AnalyticsTotalUsageResponse>('/api/v6/usage/total')
const { data: dailyUsage, pending: loadingDaily } =
  useFetch<AnalyticsDailyUsageResponse>('/api/v6/usage/daily')

const chartContainer = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// 初始化 ECharts
onMounted(() => {
  watch(
    [chartContainer, dailyUsage],
    () => {
      if (!chartContainer.value || !dailyUsage.value?.data) return

      // 销毁之前的图表实例
      if (chartInstance) {
        chartInstance.dispose()
      }

      // 初始化 ECharts 实例
      chartInstance = echarts.init(chartContainer.value)

      const dates = dailyUsage.value.data.map((item) => item.date)
      const counts = dailyUsage.value.data.map((item) => item.count)

      // 配置图表选项
      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderWidth: 0,
          textStyle: {
            color: '#fff',
          },
          formatter: (params: any) => {
            const param = params[0]
            return `${param.axisValue}<br/>使用次数: ${formatNumber(
              param.value
            )}`
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: dates,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#e5e7eb',
            },
          },
          axisLabel: {
            color: '#6b7280',
            rotate: 45,
            fontSize: 11,
          },
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: '#6b7280',
            formatter: (value: number) => formatNumber(value),
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed',
            },
          },
        },
        series: [
          {
            name: '使用次数',
            type: 'line',
            data: counts,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#3b82f6',
              width: 2,
            },
            itemStyle: {
              color: '#3b82f6',
              borderColor: '#fff',
              borderWidth: 2,
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
                ],
              },
            },
            emphasis: {
              focus: 'series',
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(59, 130, 246, 0.5)',
              },
            },
          },
        ],
      }

      chartInstance.setOption(option)

      // 响应式调整
      const resizeObserver = new ResizeObserver(() => {
        chartInstance?.resize()
      })
      resizeObserver.observe(chartContainer.value)

      // 清理观察器
      onUnmounted(() => {
        resizeObserver.disconnect()
      })
    },
    { immediate: true }
  )
})

// 清理图表实例
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style scoped lang="scss"></style>
