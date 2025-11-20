<template>
  <footer
    class="mt-auto border-t border-gray-100 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
  >
    <UContainer class="py-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div
          class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <UIcon name="i-heroicons-chart-bar-20-solid" class="w-5 h-5" />
          <span>© {{ new Date().getFullYear() }} InPageEdit Analytics</span>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <a
            href="https://github.com/inpageedit/inpageedit-analytics-next"
            target="_blank"
            class="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <UIcon name="i-simple-icons-github" class="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a
            href="https://github.com/inpageedit/inpageedit-next"
            target="_blank"
            class="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <span>@inpageedit/core</span>
          </a>
          <NuxtLink
            to="/about"
            class="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            关于项目
          </NuxtLink>
        </div>
      </div>
    </UContainer>
  </footer>
</template>
