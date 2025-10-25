<template>
  <div class="scroll-animation-container">
    <div class="progress-bar" :style="{ width: scrollProgress + '%' }"></div>
    <section class="content" ref="classElement">
      <h1 class="card-title">项目分层策略</h1>
      <div class="card overflow-x-auto">
        <OrganizationChart :value="data">
          <template #default="slotProps">
            <span>{{ slotProps.node.label }}</span>
          </template>
        </OrganizationChart>
      </div>
    </section>
    <!-- <section class="content">
      <div
        class="animated-box"
        :style="{
          opacity: boxOpacity,
          transform: `rotate(${boxRotation}deg) scale(${boxScale})`,
        }"
      >
        随滚动动画
      </div>
    </section> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const scrollProgress = ref(0);
const boxOpacity = ref(0);
const boxRotation = ref(0);
const boxScale = ref(0.5);
const classElement = ref<HTMLElement | null>(null);

// 修复数据：确保每个节点都有唯一的 key
const data = ref<any>({
  label: "Argentina",
  children: [
    {
      label: "Argentina",
      children: [
        {
          label: "Argentina",
        },
        {
          label: "Croatia",
        },
      ],
    },
    {
      label: "France",
      children: [
        {
          label: "France",
        },
        {
          label: "Morocco",
        },
      ],
    },
  ],
});

const handleScroll = () => {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;

  // 滚动进度 (0-100)
  scrollProgress.value = (scrollY / documentHeight) * 100;

  // 内容区域动画 - 基于视口中心的计算
  const element = classElement.value;
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const elementTop = rect.top;
  const elementHeight = rect.height;

  // 当元素进入视口时开始动画
  const viewportCenter = windowHeight / 2;
  const elementCenter = elementTop + elementHeight / 2;

  // 计算元素中心与视口中心的距离比例
  const distanceFromCenter = Math.abs(viewportCenter - elementCenter);
  const maxDistance = windowHeight / 2 + elementHeight / 2;

  // 当元素接近视口中心时，动画进度为1，远离时为0
  let animationProgress = 1 - distanceFromCenter / maxDistance;
  animationProgress = Math.max(0, Math.min(1, animationProgress));

  // 应用动画进度
  boxOpacity.value = animationProgress;
  boxRotation.value = animationProgress * 360;
  boxScale.value = 0.5 + animationProgress * 0.5;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.scroll-animation-container {
  min-height: 100vh; /* 确保有足够的滚动空间 */
  background-attachment: fixed;
  background-image: url("https://s2.loli.net/2025/04/02/Wc3qF7w2OVNiKlG.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.5s ease-in-out;
}

.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
  z-index: 1000;
  transition: width 0.1s;
}

.content {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.animated-box {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  /* 移除transition，让动画完全由JavaScript控制 */
}

.card-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
}
</style>
