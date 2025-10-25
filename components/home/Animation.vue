<template>
  <div class="scroll-animation-container">
    <div class="progress-bar" :style="{ width: scrollProgress + '%' }"></div>

    <!-- 添加背景遮罩层 -->
    <div class="background-overlay"></div>

    <!-- 添加浮动粒子背景 -->
    <div class="floating-particles">
      <div v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>

    <section class="content" ref="classElement">
      <!-- 添加卡片容器 -->
      <div class="main-card">
        <!-- 图片区域 -->
        <div class="image-section">
          <div class="image-container">
            <Image
              :src="processingCenterImage"
              alt="处理中心"
              width="280"
              class="floating-image"
            />
            <div class="image-glow"></div>
          </div>
        </div>

        <!-- 标题区域 -->
        <div class="title-section">
          <h1 class="card-title">
            <span class="title-text">项目分层策略</span>
            <div class="title-underline"></div>
          </h1>
          <p class="subtitle">多层次架构 · 清晰分工 · 高效协作</p>
        </div>

        <!-- 组织结构图区域 -->
        <div class="chart-section">
          <div class="chart-container">
            <div class="chart-card">
              <OrganizationChart :value="data" class="custom-org-chart">
                <template #default="slotProps">
                  <div class="org-node">
                    <span class="node-label">{{ slotProps.node.label }}</span>
                  </div>
                </template>
              </OrganizationChart>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import Image from "primevue/image";
import processingCenterImage from "~/assets/处理中心.png";

const scrollProgress = ref(0);
const classElement = ref<HTMLElement | null>(null);

// 生成粒子样式
const particleStyle = (index: number) => {
  const size = Math.random() * 6 + 2;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 5;
  const opacity = Math.random() * 0.3 + 0.1;

  return {
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    opacity: opacity.toString(),
    left: `${Math.random() * 100}%`,
  };
};

// 更合理的项目分层数据结构
const data = ref<any>({
  label: "项目管理委员会",
  children: [
    {
      label: "战略决策层",
      children: [
        {
          label: "项目总监",
          children: [
            {
              label: "产品经理团队",
            },
            {
              label: "技术总监",
            },
          ],
        },
      ],
    },
    {
      label: "执行管理层",
      children: [
        {
          label: "开发团队",
          children: [
            {
              label: "前端开发组",
            },
            {
              label: "后端开发组",
            },
          ],
        },
        {
          label: "设计团队",
        },
        {
          label: "测试团队",
        },
      ],
    },
    {
      label: "支持服务层",
      children: [
        {
          label: "运维团队",
        },
        {
          label: "技术支持",
        },
      ],
    },
  ],
});

const handleScroll = () => {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;
  scrollProgress.value = (scrollY / documentHeight) * 100;
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
  min-height: 150vh;
  background-attachment: fixed;
  background-image: url("https://s2.loli.net/2025/04/02/Wc3qF7w2OVNiKlG.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

/* 背景遮罩 */
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.8) 0%,
    rgba(30, 41, 59, 0.7) 50%,
    rgba(15, 23, 42, 0.9) 100%
  );
  z-index: 1;
}

/* 浮动粒子背景 */
.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: linear-gradient(45deg, #4ecdc4, #ff6b6b);
  border-radius: 50%;
  animation: float 20s infinite linear;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
  }
}

.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96e6a1);
  z-index: 1000;
  transition: width 0.1s;
  box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 3;
  padding: 2rem;
}

/* 主卡片容器 */
.main-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 3rem;
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 80px rgba(78, 205, 196, 0.1);
  animation: cardEntrance 1s ease-out;
}

@keyframes cardEntrance {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 图片区域 */
.image-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.image-container {
  position: relative;
  display: inline-block;
}

.floating-image {
  animation: floatImage 6s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
}

@keyframes floatImage {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.image-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(78, 205, 196, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  z-index: -1;
  animation: pulseGlow 4s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%,
  100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 3rem;
}

.card-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4ecdc4, #ff6b6b, #45b7d1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  position: relative;
}

.title-text {
  position: relative;
  z-index: 2;
}

.title-underline {
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #4ecdc4, #ff6b6b);
  margin: 1rem auto;
  border-radius: 2px;
  animation: underlineExpand 2s ease-out;
}

@keyframes underlineExpand {
  0% {
    width: 0;
    opacity: 0;
  }
  100% {
    width: 100px;
    opacity: 1;
  }
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.5rem;
  font-weight: 300;
  letter-spacing: 1px;
}

/* 图表区域 */
.chart-section {
  display: flex;
  justify-content: center;
}

.chart-container {
  width: 100%;
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 10%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

:deep(.custom-org-chart .p-organizationchart-node-content) {
  background: linear-gradient(
    135deg,
    rgba(78, 205, 196, 0.2),
    rgba(255, 107, 107, 0.2)
  ) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  padding: 1.5rem 1.5rem !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

:deep(.custom-org-chart .p-organizationchart-node-content:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(78, 205, 196, 0.6) !important;
}

:deep(.custom-org-chart .p-organizationchart-line-down) {
  background: linear-gradient(to bottom, #4ecdc4, #ff6b6b) !important;
}

:deep(.custom-org-chart .p-organizationchart-line-left) {
  background: linear-gradient(to right, transparent, #4ecdc4) !important;
}

:deep(.custom-org-chart .p-organizationchart-line-right) {
  background: linear-gradient(to left, transparent, #ff6b6b) !important;
}

.org-node {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }

  .main-card {
    padding: 2rem 1.5rem;
  }

  .card-title {
    font-size: 2.2rem;
  }

  .chart-card {
    padding: 1rem;
  }

  :deep(.custom-org-chart .p-organizationchart-node-content) {
    padding: 0.8rem 1rem !important;
  }

  .node-label {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .card-title {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .main-card {
    padding: 1.5rem 1rem;
  }
}
</style>
