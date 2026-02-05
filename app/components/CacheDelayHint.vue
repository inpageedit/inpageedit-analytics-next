<template>
  <UTooltip :text="tooltipText" :popper="{ placement }" :delay-duration="0">
    <button
      type="button"
      class="inline-flex items-center align-middle text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
      :aria-label="ariaLabel"
    >
      <UIcon :name="icon" :class="iconClass" />
    </button>
  </UTooltip>
</template>

<script setup lang="ts">
interface Props {
  maxDelaySeconds: number
  reason?: string
  /**
   * @deprecated Prefer using maxDelaySeconds + reason. Kept for backward compatibility.
   */
  text?: string
  ariaLabel?: string
  icon?: string
  iconClass?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  reason: '统计数据使用缓存',
  ariaLabel: '缓存延迟提示',
  icon: 'i-tabler-clock-exclamation',
  iconClass: 'w-4 h-4',
  placement: 'top',
})

function formatDelay(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0 秒'

  if (seconds < 60) {
    return `${Math.round(seconds)} 秒`
  }

  const minutes = seconds / 60
  if (minutes < 60) {
    const rounded = minutes >= 10 ? Math.round(minutes) : Math.round(minutes * 10) / 10
    return `${rounded} 分钟`
  }

  const hours = minutes / 60
  const rounded = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10
  return `${rounded} 小时`
}

const tooltipText = computed(() => {
  if (props.text) return props.text
  return `${props.reason}，可能有最多约 ${formatDelay(props.maxDelaySeconds)} 延迟。`
})
</script>
