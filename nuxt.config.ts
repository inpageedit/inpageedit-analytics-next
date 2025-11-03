// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/content', '@nuxt/fonts'],
  content: {
    database: {
      type: 'd1',
      bindingName: 'D1',
    },
  },
  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      wrangler: {},
    },
  },
  fonts: {
    provider: 'local',
  },
})
