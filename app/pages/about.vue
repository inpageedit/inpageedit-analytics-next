<template>
  <div class="space-y-8">
    <!-- 面包屑导航 -->
    <UBreadcrumb :items="breadcrumbItems" />

    <!-- 页面标题 -->
    <div class="text-center space-y-4 py-8">
      <div class="flex justify-center">
        <div
          class="w-20 h-20 bg-linear-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl"
        >
          <UIcon
            name="i-heroicons-chart-bar-20-solid"
            class="w-10 h-10 text-white"
          />
        </div>
      </div>
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
        InPageEdit Analytics
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        实时追踪和分析 InPageEdit NEXT 的全球使用情况
      </p>
    </div>

    <!-- 项目介绍 -->
    <UCard>
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            关于项目
          </h2>
          <div class="prose prose-gray dark:prose-invert max-w-none">
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              InPageEdit Analytics 是 InPageEdit NEXT
              项目的配套统计分析平台。通过收集和展示全球范围内的使用数据，
              帮助开发者和社区更好地了解工具的使用情况，优化功能设计，提升用户体验。
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div
                class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-eye"
                  class="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                实时监控
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              实时追踪全球用户的编辑活动，提供最新的使用数据和趋势分析。
            </p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div
                class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-chart-pie"
                  class="w-5 h-5 text-green-600 dark:text-green-400"
                />
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                数据分析
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              深入分析使用模式，帮助优化功能和改善用户体验。
            </p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div
                class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-shield-check"
                  class="w-5 h-5 text-purple-600 dark:text-purple-400"
                />
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                隐私保护
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              仅收集必要的统计数据，保护用户隐私，遵循最佳实践。
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 技术栈 -->
    <UCard>
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">技术栈</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            class="flex flex-col items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <UIcon
              name="i-simple-icons-nuxtdotjs"
              class="w-8 h-8 text-green-500"
            />
            <span class="text-sm font-medium text-gray-900 dark:text-white"
              >Nuxt 4</span
            >
          </div>
          <div
            class="flex flex-col items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <UIcon
              name="i-simple-icons-vue-dot-js"
              class="w-8 h-8 text-green-500"
            />
            <span class="text-sm font-medium text-gray-900 dark:text-white"
              >Vue 3</span
            >
          </div>
          <div
            class="flex flex-col items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <UIcon
              name="i-simple-icons-tailwindcss"
              class="w-8 h-8 text-sky-500"
            />
            <span class="text-sm font-medium text-gray-900 dark:text-white"
              >Tailwind CSS</span
            >
          </div>
          <div
            class="flex flex-col items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <UIcon
              name="i-simple-icons-cloudflare"
              class="w-8 h-8 text-orange-500"
            />
            <span class="text-sm font-medium text-gray-900 dark:text-white"
              >Cloudflare</span
            >
          </div>
        </div>
      </div>
    </UCard>

    <!-- 链接 -->
    <UCard>
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          相关链接
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://github.com/inpageedit/inpageedit-analytics-next"
            target="_blank"
            class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
          >
            <UIcon
              name="i-simple-icons-github"
              class="w-6 h-6 text-gray-700 dark:text-gray-300"
            />
            <div class="flex-1">
              <div class="font-semibold text-gray-900 dark:text-white">
                GitHub 仓库
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                查看源代码
              </div>
            </div>
            <UIcon
              name="i-heroicons-arrow-top-right-on-square"
              class="w-5 h-5 text-gray-400"
            />
          </a>

          <a
            href="https://www.ipe.wiki/analytics/"
            target="_blank"
            class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
          >
            <UIcon
              name="i-heroicons-book-open"
              class="w-6 h-6 text-gray-700 dark:text-gray-300"
            />
            <div class="flex-1">
              <div class="font-semibold text-gray-900 dark:text-white">
                项目文档
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                使用指南和 API 文档
              </div>
            </div>
            <UIcon
              name="i-heroicons-arrow-top-right-on-square"
              class="w-5 h-5 text-gray-400"
            />
          </a>

          <a
            href="https://github.com/inpageedit/inpageedit-analytics-next/issues"
            target="_blank"
            class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
          >
            <UIcon
              name="i-heroicons-bug-ant"
              class="w-6 h-6 text-gray-700 dark:text-gray-300"
            />
            <div class="flex-1">
              <div class="font-semibold text-gray-900 dark:text-white">
                问题反馈
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                报告 Bug 或提出建议
              </div>
            </div>
            <UIcon
              name="i-heroicons-arrow-top-right-on-square"
              class="w-5 h-5 text-gray-400"
            />
          </a>

          <NuxtLink
            to="/"
            class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
          >
            <UIcon
              name="i-heroicons-chart-bar-square"
              class="w-6 h-6 text-gray-700 dark:text-gray-300"
            />
            <div class="flex-1">
              <div class="font-semibold text-gray-900 dark:text-white">
                返回仪表盘
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                查看统计数据
              </div>
            </div>
            <UIcon
              name="i-heroicons-arrow-right"
              class="w-5 h-5 text-gray-400"
            />
          </NuxtLink>
        </div>
      </div>
    </UCard>

    <!-- 版权信息 -->
    <div class="text-center py-6">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        © {{ new Date().getFullYear() }} InPageEdit Analytics. Built with ❤️
        using Nuxt & Tailwind CSS.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '关于',
})

// 面包屑导航
const breadcrumbItems = [
  {
    label: '首页',
    to: '/',
    icon: 'i-heroicons-home',
  },
  {
    label: '关于',
    to: '#',
    icon: 'i-heroicons-information-circle',
  },
]
</script>

<style scoped lang="scss"></style>
