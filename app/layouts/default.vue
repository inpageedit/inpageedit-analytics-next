<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <header
      class="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800"
    >
      <UContainer class="py-4">
        <nav class="flex items-center justify-between w-full">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-chart-bar-20-solid"
                class="w-7 h-7 text-primary"
              />
              <NuxtLink
                to="/"
                class="text-xl font-bold text-gray-900 dark:text-white hover:text-primary transition-colors"
              >
                InPageEdit Analytics
              </NuxtLink>
            </div>
            <UBadge color="primary" variant="subtle" size="xs">NEXT</UBadge>
          </div>
          <div class="flex items-center gap-1">
            <UButton
              to="/"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-home"
            >
              首页
            </UButton>
            <UButton
              to="/about"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-information-circle"
            >
              关于
            </UButton>
            <UColorModeButton />
          </div>
        </nav>
      </UContainer>
    </header>

    <main class="flex-1 pt-16 pb-8">
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </main>

    <footer
      class="mt-auto border-t border-gray-100 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
    >
      <UContainer class="py-8">
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-4"
        >
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
  </div>
</template>
