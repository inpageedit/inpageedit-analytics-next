<template>
  <ErrorPageBase
    :status-code="401"
    :messages="messages"
    :tips="tips"
    :floating-icons="floatingIcons"
    :quick-links="quickLinks"
  />
</template>

<script setup lang="ts">
useHead({
  title: '401 - 未授权',
})

const messages = [
  '您需要登录才能访问此页面。',
  '身份验证失败，请重新登录。',
  '此页面需要登录权限。',
  '您的登录已过期，请重新登录。',
  '访问被拒绝：需要身份验证。',
]

const tips = [
  '请先登录您的账户。',
  '检查您的登录状态是否有效。',
  '如果已登录，请尝试重新登录。',
  '确保您有访问此资源的权限。',
]

const floatingIcons = ['🔒', '👤', '🔑', '🛡️', '🚪', '🔐', '👥', '🎫']

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

