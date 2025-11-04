<template>
  <div>
    <header class="border-b">
      <UContainer class="py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-chart-bar-20-solid" class="w-5 h-5" />
          <NuxtLink to="/" class="font-semibold"
            >InPageEdit Analytics
            <UBadge color="primary" variant="soft" label="NEXT"
          /></NuxtLink>
        </div>
        <div class="flex items-center gap-2">
          <UButton to="/" color="primary" variant="ghost" label="首页" />
          <UButton to="/about" color="primary" variant="ghost" label="关于" />
        </div>
      </UContainer>
    </header>
    <main>
      <UContainer class="py-6">
        <slot />
      </UContainer>
    </main>
    <footer class="border-t">
      <UContainer class="py-6 text-sm text-gray-500">
        © {{ new Date().getFullYear() }} InPageEdit Analytics
      </UContainer>
    </footer>
  </div>
</template>
