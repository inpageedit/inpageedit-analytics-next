<template>
  <ErrorPageBase
    :status-code="502"
    :messages="messages"
    :tips="tips"
    :floating-icons="floatingIcons"
    :quick-links="quickLinks"
  />
</template>

<script setup lang="ts">
useHead({
  title: '502 - 网关错误',
})

const messages = [
  '网关服务器收到了无效响应。',
  '上游服务器无响应，请稍后再试。',
  '网关暂时无法连接后端服务。',
  '服务器之间的通信出现了问题。',
  '网关超时，无法获取响应。',
]

const tips = [
  '这通常是临时性问题，请稍后重试。',
  '可能是服务器正在维护中。',
  '如果问题持续，请联系技术支持。',
  '检查您的网络连接是否正常。',
]

const floatingIcons = ['🌐', '📡', '🔌', '⚡', '🔄', '📶', '🔗', '🌍']

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

