// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/fonts'],
  css: ['~/assets/styles/main.css'],
  // content: {
  //   database: {
  //     type: 'd1',
  //     bindingName: 'D1',
  //   },
  // },
  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      wrangler: {},
    },
  },
  fonts: {
    provider: 'local',
  },
  server: {},
  devServer: {
    port: 20105,
    cors: {
      origin: '*',
    },
  },
})
