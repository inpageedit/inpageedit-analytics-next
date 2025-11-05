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
      <!-- 404 大标题 -->
      <div class="space-y-4">
        <div class="relative inline-block">
          <h1
            class="text-[120px] md:text-[180px] font-black text-transparent bg-clip-text bg-linear-to-r from-primary-400 via-purple-500 to-pink-500 animate-gradient select-none"
            @click="shake"
            :class="{ 'animate-shake': isShaking }"
          >
            404
          </h1>
          <!-- 眼睛效果 -->
          <div
            class="absolute top-8 md:top-12 left-[15%] md:left-[20%] flex gap-8 md:gap-12"
          >
            <div
              class="eye w-12 h-12 md:w-16 md:h-16 bg-gray-800 dark:bg-white rounded-full relative cursor-pointer"
              @mousemove="moveEye"
            >
              <div
                ref="eyeball1"
                class="eyeball w-5 h-5 md:w-7 md:h-7 bg-gray-900 dark:bg-gray-900 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
              ></div>
            </div>
            <div
              class="eye w-12 h-12 md:w-16 md:h-16 bg-gray-800 dark:bg-white rounded-full relative cursor-pointer"
              @mousemove="moveEye"
            >
              <div
                ref="eyeball2"
                class="eyeball w-5 h-5 md:w-7 md:h-7 bg-gray-900 dark:bg-gray-900 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
              ></div>
            </div>
          </div>
        </div>

        <h2
          class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200"
        >
          {{ currentMessage }}
        </h2>
      </div>

      <!-- 有趣的提示卡片 -->
      <UCard class="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <UIcon
              name="i-heroicons-light-bulb"
              class="w-6 h-6 text-yellow-500 shrink-0 mt-1"
            />
            <p class="text-gray-700 dark:text-gray-300 text-left">
              {{ currentTip }}
            </p>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            @click="changeMessage"
            class="w-full"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            换一个提示
          </UButton>
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
        <UButton to="/" size="lg" class="group">
          <UIcon name="i-heroicons-home" class="w-5 h-5" />
          回到首页
          <UIcon
            name="i-heroicons-arrow-right"
            class="w-4 h-4 group-hover:translate-x-1 transition-transform"
          />
        </UButton>

        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          @click="goBack"
          class="group"
        >
          <UIcon
            name="i-heroicons-arrow-left"
            class="w-4 h-4 group-hover:-translate-x-1 transition-transform"
          />
          返回上一页
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
useHead({
  title: '404 - 页面不存在',
})

// 有趣的消息列表
const messages = [
  '哎呀！这个页面去 Wiki 编辑了',
  '404：页面正在参加愚人节活动',
  '这个页面被 InPageEdit 编辑走了',
  '页面失踪了，可能在某个 Wiki 上',
  '错误 404：页面正在修炼成仙',
  '这个页面去找它的代码了',
  '页面走丢了，可能在平行宇宙里',
  '404：此页面已退出群聊',
]

// 有趣的提示列表
const tips = [
  '据说点击 404 数字会有惊喜... 🤔',
  '温馨提示：移动鼠标可以和上面的眼睛互动哦！👀',
  '你知道吗？InPageEdit 已经帮助用户完成了数百万次编辑！',
  '这个 404 页面比你要找的页面有趣多了！',
  '恭喜你发现了彩蛋页面！（其实只是 404）',
  '建议：不要在这里待太久，你还有很多 Wiki 要编辑！',
  '404 可能是最受欢迎的 HTTP 状态码了',
  '试试点击"换一个提示"按钮，说不定有更好笑的！',
  '你已经在这个页面待了挺久了，要不要回首页看看？',
  '趣味知识：404 这个数字在某些文化中可能有特殊含义！',
]

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

// 状态管理
const currentMessage = ref(
  messages[Math.floor(Math.random() * messages.length)]
)
const currentTip = ref(tips[Math.floor(Math.random() * tips.length)])
const isShaking = ref(false)
const visitCount = ref(0)
const timeOnPage = ref(0)
const eyeball1 = ref<HTMLElement | null>(null)
const eyeball2 = ref<HTMLElement | null>(null)

// 浮动图标
const floatingIcons = ref(
  Array.from({ length: 15 }, (_, i) => ({
    id: i,
    icon: ['📝', '✨', '🎨', '🚀', '⭐', '💡', '🎯', '🔥'][i % 8],
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
  }))
)

// 换一条消息和提示
const changeMessage = () => {
  let newMessage = messages[Math.floor(Math.random() * messages.length)]
  let newTip = tips[Math.floor(Math.random() * tips.length)]

  while (newMessage === currentMessage.value) {
    newMessage = messages[Math.floor(Math.random() * messages.length)]
  }
  while (newTip === currentTip.value) {
    newTip = tips[Math.floor(Math.random() * tips.length)]
  }

  currentMessage.value = newMessage
  currentTip.value = newTip
}

// 点击 404 抖动效果
const shake = () => {
  isShaking.value = true
  changeMessage()
  setTimeout(() => {
    isShaking.value = false
  }, 500)
}

// 眼睛跟随鼠标
const moveEye = (event: MouseEvent) => {
  const eye = event.currentTarget as HTMLElement
  const eyeball = eye.querySelector('.eyeball') as HTMLElement
  if (!eyeball) return

  const eyeRect = eye.getBoundingClientRect()
  const eyeCenterX = eyeRect.left + eyeRect.width / 2
  const eyeCenterY = eyeRect.top + eyeRect.height / 2

  const angle = Math.atan2(
    event.clientY - eyeCenterY,
    event.clientX - eyeCenterX
  )
  const distance = Math.min(eyeRect.width / 4, eyeRect.height / 4)

  const x = Math.cos(angle) * distance
  const y = Math.sin(angle) * distance

  eyeball.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
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
  // 从 localStorage 读取访问次数
  const stored = localStorage.getItem('404-visit-count')
  visitCount.value = stored ? parseInt(stored) + 1 : 1
  localStorage.setItem('404-visit-count', visitCount.value.toString())

  // 计时器
  const timer = setInterval(() => {
    timeOnPage.value++
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })

  // 随机眨眼效果
  const blinkInterval = setInterval(() => {
    const eyes = document.querySelectorAll('.eye')
    eyes.forEach((eye) => {
      eye.classList.add('blink')
      setTimeout(() => {
        eye.classList.remove('blink')
      }, 200)
    })
  }, 4000 + Math.random() * 3000)

  onUnmounted(() => {
    clearInterval(blinkInterval)
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

.eye.blink {
  animation: blink 0.2s;
}

@keyframes blink {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.1);
  }
}

/* 鼠标悬停效果 */
.eye:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}
</style>
