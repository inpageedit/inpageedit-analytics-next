<template>
  <UApp>
    <NuxtLayout>
      <article>
        <ErrorPage404 v-if="statusCode === 404" />
        <ErrorPage400 v-else-if="statusCode === 400" />
        <ErrorPage401 v-else-if="statusCode === 401" />
        <ErrorPage403 v-else-if="statusCode === 403" />
        <ErrorPage500 v-else-if="statusCode === 500" />
        <ErrorPage502 v-else-if="statusCode === 502" />
        <ErrorPage503 v-else-if="statusCode === 503" />
        <div v-else>
          <h1>{{ statusCode }}</h1>
          <NuxtLink to="/">Go back home</NuxtLink>
        </div>
        <UCard class="mt-8 max-w-2xl mx-auto">
          <details>
            <summary>反正你应该不感兴趣</summary>
            <pre>{{ error }}</pre>
          </details>
        </UCard>
      </article>
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const route = useRoute()
const statusCode = computed(() => {
  return Number(route.query._status) || props.error.statusCode || 500
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
