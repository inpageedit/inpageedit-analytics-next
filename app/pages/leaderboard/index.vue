<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <div class="space-y-3">
      <!-- 面包屑导航 -->
      <UBreadcrumb :items="breadcrumbItems" />

      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-trophy" class="w-8 h-8 text-primary" />
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            排行榜
          </h1>
        </div>
        <p class="text-gray-600 dark:text-gray-400">
          查看最近 30 天内的站点和用户使用排行
        </p>
      </div>
    </div>

    <!-- 排行榜导航卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 站点排行榜 -->
      <NuxtLink to="/leaderboard/site">
        <UCard
          class="hover:shadow-lg hover:border-primary transition-all duration-200 cursor-pointer h-full"
        >
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-globe-alt"
                class="w-8 h-8 text-purple-500"
              />
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  站点排行榜
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  最近 30 天使用量最高的站点
                </p>
              </div>
            </div>
          </template>
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              查看哪些 Wiki 站点在最近一个月内使用 InPageEdit 最频繁
            </p>
            <div class="flex items-center gap-2 text-primary">
              <span class="font-medium">查看排行</span>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
            </div>
          </div>
        </UCard>
      </NuxtLink>

      <!-- 用户排行榜 -->
      <NuxtLink to="/leaderboard/user">
        <UCard
          class="hover:shadow-lg hover:border-primary transition-all duration-200 cursor-pointer h-full"
        >
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-user-group"
                class="w-8 h-8 text-green-500"
              />
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  用户排行榜
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  最近 30 天最活跃的编辑者
                </p>
              </div>
            </div>
          </template>
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              查看哪些用户在最近一个月内使用 InPageEdit 编辑最频繁
            </p>
            <div class="flex items-center gap-2 text-primary">
              <span class="font-medium">查看排行</span>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>

    <!-- 说明信息 -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-information-circle"
            class="w-5 h-5 text-blue-500"
          />
          <span class="font-semibold text-gray-900 dark:text-white">
            关于排行榜
          </span>
        </div>
      </template>
      <div class="space-y-3 text-gray-600 dark:text-gray-400">
        <p>
          排行榜统计最近 30 天内的使用数据，包括站点和用户的 InPageEdit
          使用次数。
        </p>
        <ul class="list-disc list-inside space-y-2 ml-2">
          <li>
            <strong class="text-gray-700 dark:text-gray-300">站点排行榜</strong
            >：展示使用 InPageEdit 次数最多的 Wiki 站点
          </li>
          <li>
            <strong class="text-gray-700 dark:text-gray-300">用户排行榜</strong
            >：展示使用 InPageEdit 次数最多的编辑者
          </li>
          <li>排行榜数据每小时更新一次</li>
          <li>前三名将获得金、银、铜牌标识</li>
        </ul>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '排行榜',
})

// 面包屑导航
const breadcrumbItems = [
  {
    label: '首页',
    to: '/',
    icon: 'i-heroicons-home',
  },
  {
    label: '排行榜',
    to: '#',
    icon: 'i-heroicons-trophy',
  },
]
</script>
