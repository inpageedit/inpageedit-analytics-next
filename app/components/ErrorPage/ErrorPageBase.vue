<template>
  <div
    class="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden"
  >
    <!-- 背景动画小图标 -->
    <div
      v-for="i in floatingIcons"
      :key="i.id"
      class="floating-icon absolute opacity-10 text-4xl"
      :style="{
        left: i.left + '%',
        top: i.top + '%',
        animationDelay: i.delay + 's',
        animationDuration: i.duration + 's',
      }"
    >
      {{ i.icon }}
    </div>

    <!-- 主要内容 -->
    <div class="relative z-10 text-center space-y-8 max-w-2xl">
      <!-- 状态码大标题 -->
      <div class="space-y-4 relative">
        <!-- 眼睛彩蛋（可选） -->
        <div
          v-if="showEyes"
          class="absolute top-6 left-1/2 -translate-x-1/2 flex gap-10 pointer-events-none z-20"
          :class="{ 'animate-shake': isShaking }"
        >
          <div
            ref="leftEye"
            class="w-20 h-20 bg-white rounded-full border-[6px] border-gray-800 dark:border-gray-200 flex items-center justify-center overflow-hidden shadow-xl relative"
          >
            <div
              class="w-10 h-10 bg-black rounded-full transition-transform duration-75 ease-out relative"
              :style="{ transform: leftPupilTransform }"
            >
              <div
                class="absolute top-1 left-1.5 w-2.5 h-2.5 bg-white rounded-full opacity-90"
              ></div>
            </div>
          </div>
          <div
            ref="rightEye"
            class="w-20 h-20 bg-white rounded-full border-[6px] border-gray-800 dark:border-gray-200 flex items-center justify-center overflow-hidden shadow-xl relative"
          >
            <div
              class="w-10 h-10 bg-black rounded-full transition-transform duration-75 ease-out relative"
              :style="{ transform: rightPupilTransform }"
            >
              <div
                class="absolute top-1 left-1.5 w-2.5 h-2.5 bg-white rounded-full opacity-90"
              ></div>
            </div>
          </div>
        </div>

        <h1
          class="text-[120px] md:text-[180px] font-black text-transparent bg-clip-text bg-linear-to-r from-primary-400 via-purple-500 to-pink-500 animate-gradient select-none"
          @click="shake"
          :class="{ 'animate-shake': isShaking }"
        >
          {{ statusCode }}
        </h1>

        <h2
          class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200"
        >
          {{ currentMessage }}
        </h2>
      </div>

      <!-- 有趣的提示卡片 -->
      <UCard class="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
        <div class="space-y-4">
          <div class="flex gap-3 items-center justify-center">
            <UIcon
              name="i-heroicons-light-bulb"
              class="w-6 h-6 text-yellow-500 shrink-0 mt-1"
            />
            <p class="text-gray-700 dark:text-gray-300 text-left">
              {{ currentTip }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- 统计信息 -->
      <div class="flex items-center justify-center gap-8 text-sm">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ visitCount }}
          </div>
          <div class="text-gray-500 dark:text-gray-400">本页访问次数</div>
        </div>
        <div class="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ timeOnPage }}s
          </div>
          <div class="text-gray-500 dark:text-gray-400">你在这里待了</div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          @click="goBack"
          class="group cursor-pointer"
        >
          <UIcon
            name="i-heroicons-arrow-left"
            class="w-4 h-4 group-hover:-translate-x-1 transition-transform"
          />
          返回上一页
        </UButton>

        <UButton to="/" size="lg" class="group">
          <UIcon name="i-heroicons-home" class="w-5 h-5" />
          回到首页
          <UIcon
            name="i-heroicons-arrow-right"
            class="w-4 h-4 group-hover:translate-x-1 transition-transform"
          />
        </UButton>
      </div>

      <!-- 快速导航 -->
      <div class="pt-8">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          或者试试这些页面：
        </p>
        <div class="flex flex-wrap gap-2 justify-center">
          <UButton
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            color="neutral"
            variant="soft"
            size="sm"
          >
            <UIcon :name="link.icon" class="w-4 h-4" />
            {{ link.label }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface QuickLink {
  to: string
  label: string
  icon: string
}

interface FloatingIcon {
  id: number
  icon: string
  left: number
  top: number
  delay: number
  duration: number
}

interface Props {
  statusCode: number | string
  messages: string[]
  tips: string[]
  showEyes?: boolean
  floatingIcons?: string[]
  quickLinks?: QuickLink[]
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  showEyes: false,
  floatingIcons: () => ['📝', '✨', '🎨', '🚀', '⭐', '💡', '🎯', '🔥'],
  quickLinks: () => [
    { to: '/', label: '仪表盘', icon: 'i-heroicons-chart-bar-square' },
    {
      to: '/leaderboard/user',
      label: '用户排行',
      icon: 'i-heroicons-user-group',
    },
    { to: '/leaderboard/site', label: '站点排行', icon: 'i-heroicons-globe-alt' },
    { to: '/about', label: '关于', icon: 'i-heroicons-information-circle' },
  ],
  storageKey: undefined,
})

// 状态管理
const currentMessage = ref(
  props.messages[Math.floor(Math.random() * props.messages.length)]
)
const currentTip = ref(props.tips[Math.floor(Math.random() * props.tips.length)])
const isShaking = ref(false)
const visitCount = ref(0)
const timeOnPage = ref(0)

// 浮动图标
const floatingIcons = ref<FloatingIcon[]>(
  Array.from({ length: 15 }, (_, i) => ({
    id: i,
    icon: props.floatingIcons[i % props.floatingIcons.length] || '✨',
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
  }))
)

// 换一条消息和提示
const changeMessage = () => {
  let newMessage = props.messages[Math.floor(Math.random() * props.messages.length)]
  let newTip = props.tips[Math.floor(Math.random() * props.tips.length)]

  while (newMessage === currentMessage.value) {
    newMessage = props.messages[Math.floor(Math.random() * props.messages.length)]
  }
  while (newTip === currentTip.value) {
    newTip = props.tips[Math.floor(Math.random() * props.tips.length)]
  }

  currentMessage.value = newMessage
  currentTip.value = newTip
}

// 点击状态码抖动效果
const shake = () => {
  isShaking.value = true
  changeMessage()
  setTimeout(() => {
    isShaking.value = false
  }, 500)
}

// 眼睛跟随光标
const leftEye = ref<HTMLElement | null>(null)
const rightEye = ref<HTMLElement | null>(null)
const leftPupilTransform = ref('translate(0, 0)')
const rightPupilTransform = ref('translate(0, 0)')

const handleMouseMove = (e: MouseEvent) => {
  if (!props.showEyes || !leftEye.value || !rightEye.value) return

  const updateOneEye = (
    eye: HTMLElement,
    otherEye: HTMLElement,
    isLeft: boolean
  ) => {
    const rect = eye.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const otherRect = otherEye.getBoundingClientRect()

    // 斗鸡眼判定：光标在两眼之间且垂直距离不过远
    const gapThreshold = 20
    const betweenXStart = (isLeft ? rect.right : otherRect.right) + gapThreshold
    const betweenXEnd = (isLeft ? otherRect.left : rect.left) - gapThreshold

    const isValidRange = betweenXEnd > betweenXStart
    const isBetweenX =
      isValidRange && e.clientX > betweenXStart && e.clientX < betweenXEnd

    const isNearY = Math.abs(e.clientY - centerY) < 50

    if (isBetweenX && isNearY) {
      return isLeft ? 'translate(16px, 0)' : 'translate(-16px, 0)'
    }

    // 正常跟随
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const angle = Math.atan2(dy, dx)
    const maxDist = 20
    const dist = Math.min(maxDist, Math.hypot(dx, dy) / 6)

    return `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`
  }

  leftPupilTransform.value = updateOneEye(leftEye.value, rightEye.value, true)
  rightPupilTransform.value = updateOneEye(rightEye.value, leftEye.value, false)
}

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/')
  }
}

// 访问计数和计时器
onMounted(() => {
  if (props.showEyes) {
    window.addEventListener('mousemove', handleMouseMove)
  }

  // 从 localStorage 读取访问次数
  const storageKey = computed(() => props.storageKey || `error-${props.statusCode}-visit-count`)
  const stored = localStorage.getItem(storageKey.value)
  visitCount.value = stored ? parseInt(stored) + 1 : 1
  localStorage.setItem(storageKey.value, visitCount.value.toString())

  // 计时器
  const timer = setInterval(() => {
    timeOnPage.value++
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)
    if (props.showEyes) {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  })
})
</script>

<style scoped>
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: rotate(-5deg);
  }
  20%,
  40%,
  60%,
  80% {
    transform: rotate(5deg);
  }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.1;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.3;
  }
}

.floating-icon {
  animation: float 10s ease-in-out infinite;
  pointer-events: none;
}
</style>

