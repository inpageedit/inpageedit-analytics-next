<template>
  <UApp>
    <NuxtLoadingIndicator />
    <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <AppHeader />

      <main class="flex-1 pt-16 pb-8">
        <UContainer class="py-8">
          <article>
            <ErrorPage404 v-if="statusCode === 404" />
            <ErrorPage400 v-else-if="statusCode === 400" />
            <ErrorPage401 v-else-if="statusCode === 401" />
            <ErrorPage403 v-else-if="statusCode === 403" />
            <ErrorPage500 v-else-if="statusCode === 500" />
            <ErrorPage502 v-else-if="statusCode === 502" />
            <ErrorPage503 v-else-if="statusCode === 503" />
            <div
              v-else
              class="min-h-[60vh] flex flex-col items-center justify-center px-4"
            >
              <h1 class="text-6xl font-bold mb-4">{{ statusCode }}</h1>
              <p class="text-xl mb-8">
                {{ error.message || '出现了一些问题' }}
              </p>
              <UButton to="/" size="lg">返回首页</UButton>
            </div>
            <UCard class="mt-8 max-w-2xl mx-auto">
              <details>
                <summary>反正你应该不感兴趣</summary>
                <pre>{{ error }}</pre>
              </details>
            </UCard>
          </article>
        </UContainer>
      </main>

      <AppFooter />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => {
  return props.error.statusCode || 500
})
</script>

<style scoped>
details {
  font-size: 0.875rem;
}

details summary {
  user-select: none;
  padding: 0.5rem;
  font-weight: 500;
  color: rgb(var(--color-gray-500));
  transition: color 0.2s;
  cursor: pointer;
}

details summary:hover {
  color: rgb(var(--color-primary-500));
}

details[open] summary {
  color: rgb(var(--color-primary-500));
}

details pre {
  padding: 1rem;
  background: rgb(var(--color-gray-50));
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  font-family: monospace;
}

:global(.dark) details pre {
  background: rgb(var(--color-gray-900));
}
</style>
