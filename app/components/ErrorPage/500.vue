<template>
  <ErrorPageBase
    :status-code="500"
    :messages="messages"
    :tips="tips"
    :floating-icons="floatingIcons"
    :quick-links="quickLinks"
  />
</template>

<script setup lang="ts">
useHead({
  title: '500 - 服务器错误',
})

const messages = [
  '服务器遇到了一个错误，无法完成请求。',
  '内部服务器错误，我们正在处理。',
  '服务器出了一些问题，请稍后再试。',
  '哎呀，服务器好像出了点状况。',
  '服务器暂时无法处理您的请求。',
]

const tips = [
  '这通常是服务器端的问题，不是您的错。',
  '请稍等片刻后重试。',
  '如果问题持续存在，请联系技术支持。',
  '我们已经记录了这个错误，会尽快修复。',
]

const floatingIcons = ['💥', '🔧', '⚙️', '🛠️', '⚠️', '🔴', '📡', '💻']

const quickLinks = [
  { to: '/', label: '仪表盘', icon: 'i-heroicons-chart-bar-square' },
  {
    to: '/leaderboard/user',
    label: '用户排行',
    icon: 'i-heroicons-user-group',
  },
  { to: '/leaderboard/site', label: '站点排行', icon: 'i-heroicons-globe-alt' },
  { to: '/about', label: '关于', icon: 'i-heroicons-information-circle' },
]
</script>

