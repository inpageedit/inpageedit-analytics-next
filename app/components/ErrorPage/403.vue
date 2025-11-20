<template>
  <ErrorPageBase
    :status-code="403"
    :messages="messages"
    :tips="tips"
    :floating-icons="floatingIcons"
    :quick-links="quickLinks"
  />
</template>

<script setup lang="ts">
useHead({
  title: '403 - 禁止访问',
})

const messages = [
  '您没有权限访问此页面。',
  '访问被拒绝：权限不足。',
  '此页面仅限特定用户访问。',
  '您被禁止访问此资源。',
  '权限检查失败，无法继续。',
]

const tips = [
  '确认您是否有访问此页面的权限。',
  '如果您认为这是错误，请联系管理员。',
  '可能需要更高的权限级别。',
  '检查您的账户状态和权限设置。',
]

const floatingIcons = ['🚫', '⛔', '🛡️', '🔒', '🚧', '⚠️', '👮', '🔐']

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

