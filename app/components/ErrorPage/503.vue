<template>
  <ErrorPageBase
    :status-code="503"
    :messages="messages"
    :tips="tips"
    :floating-icons="floatingIcons"
    :quick-links="quickLinks"
  />
</template>

<script setup lang="ts">
useHead({
  title: '503 - 服务不可用',
})

const messages = [
  '服务暂时不可用，请稍后再试。',
  '服务器正在维护中，请耐心等待。',
  '服务暂时过载，无法处理请求。',
  '我们正在升级系统，很快回来。',
  '服务暂时下线，正在紧急修复中。',
]

const tips = [
  '这通常是临时性维护，请稍后重试。',
  '查看我们的状态页面了解最新信息。',
  '预计很快就能恢复正常服务。',
  '感谢您的耐心等待。',
]

const floatingIcons = ['🔧', '⏳', '🚧', '🔄', '⏰', '🛠️', '📊', '⚙️']

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

