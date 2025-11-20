<template>
  <ErrorPageBase
    :status-code="404"
    :messages="messages"
    :tips="tips"
    :show-eyes="true"
    :floating-icons="floatingIcons"
    :quick-links="quickLinks"
    storage-key="404-visit-count"
  />
</template>

<script setup lang="ts">
useHead({
  title: '404 - 页面不存在',
})

// 有趣的消息列表
const messages = [
  '此页面不存在。下面提供该页面的删除、保护和移动日志供您参考。',
  '警告：发生收容失效，请立即撤离',
  '此页面内容已被防滥用过滤器拦截',
  '修订版本#0不存在，可能已被隐藏',
  '这是一个红链，你也不能创建它！',
  '页面由 InPageEdit 强力驱动……但不包括这个',
  '正在尝试从互联网档案馆恢复……失败',
  '此页面受到级联保护，您无权查看不存在的内容',
]

// 有趣的提示列表
const tips = [
  '专家提示：您需要专家级知识来解决这个问题。',
  '您试过在 [[Special:Search]] 中搜索此页面吗？',
  '也许页面被移动了？查看一下移动日志吧。',
  'InPageEdit 可以帮您编辑页面，但在这个网站不行。',
  '如果您认为这是一个 Bug，请在 GitHub 上提交报告（大概率不是）。',
  '您看起来很迷茫，需要回退到上一版本吗？',
  '不要惊慌。带上您的毛巾，继续探索吧。',
  '刷新此页面？不，这通常不管用——但你可以试试。',
  // FF14骚话
  '就像闪耀登场释放天辉的白魔法师一样没有人喜欢！',
  '就像冰4火4一个慢动作的黑魔法师一样没有人喜欢！',
  '就像耗尽了了以太超流的学者一样没有人喜欢！',
  '就像忘记了每分钟背刺的忍者一样没有人喜欢！',
  '就像进本后跳999接受LB需求退本一气呵成的龙骑一样没有人喜欢！',
  '就像成天把拉拉菲尔族成为食材的人一样没有人喜欢！',
  '就像死而不僵状态下的暗黑骑士一样没有人喜欢！',
  '就像无论如何也触发不了诗心的诗人一样没有人喜欢！',
]

// 浮动图标
const floatingIcons = ['📝', '✨', '🎨', '🚀', '⭐', '💡', '🎯', '🔥']

// 快速导航链接
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
