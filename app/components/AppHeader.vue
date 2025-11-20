<template>
  <header
    class="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800"
  >
    <div class="overflow-x-auto">
      <UContainer class="py-4">
        <nav class="flex items-center justify-between w-full min-w-max">
          <div class="flex items-center gap-3 flex-shrink-0">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-chart-bar-20-solid"
                class="w-7 h-7 text-primary"
              />
              <NuxtLink
                to="/"
                class="text-xl font-bold text-gray-900 dark:text-white hover:text-primary transition-colors whitespace-nowrap"
              >
                InPageEdit Analytics
              </NuxtLink>
            </div>
            <UBadge color="primary" variant="subtle" size="xs">NEXT</UBadge>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <UButton
              to="/"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-home"
            >
              首页
            </UButton>
            <UButton
              to="/leaderboard"
              color="neutral"
              variant="ghost"
              icon="i-heroicons-trophy"
            >
              排行榜
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
    </div>
  </header>
</template>
