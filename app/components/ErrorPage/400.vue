<template>
  <ErrorPageBase
    :status-code="400"
    :messages="messages"
    :tips="tips"
    :floating-icons="floatingIcons"
    :quick-links="quickLinks"
  />
</template>

<script setup lang="ts">
useHead({
  title: '400 - 请求错误',
})

const messages = [
  '请求格式不正确，服务器无法理解。',
  '您的请求似乎有些问题，请检查一下。',
  '这个请求看起来不太对劲……',
  '服务器说：我不懂你在说什么。',
  '请求参数有误，请重新尝试。',
]

const tips = [
  '检查一下您输入的 URL 是否正确。',
  '可能是请求参数格式不对，请查看文档。',
  '刷新页面重试，或者返回上一页。',
  '如果问题持续存在，请联系管理员。',
]

const floatingIcons = ['⚠️', '❌', '🔍', '📋', '🔧', '💭', '🎯', '⚡']

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

