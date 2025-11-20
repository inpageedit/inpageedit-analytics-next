<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <AppHeader />

    <main class="flex-1 pt-16 pb-8">
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </main>

    <AppFooter />
  </div>
</template>
