<template>
  <div class="not-found" :style="{ backgroundColor: isLightOn ? 'white' : 'black' }">
    <div class="light-rope" @click="toggleLight"></div>
    <div
      class="not-found-font not-found-font-top"
      :style="{ color: isLightOn ? 'black' : 'white' }"
    >
      <a>{{ font.font1 }}</a>
    </div>
    <div class="not-found-eye">
      <div
        class="not-found-eye-circle not-found-eye-circle-left"
        :style="{ backgroundColor: isLightOn ? '#f0f0f0' : 'white' }"
      >
        <div class="not-found-eye-circle-inner not-found-eye-circle-inner-left"></div>
      </div>
      <div
        class="not-found-eye-circle not-found-eye-circle-right"
        :style="{ backgroundColor: isLightOn ? '#f0f0f0' : 'white' }"
      >
        <div class="not-found-eye-circle-inner not-found-eye-circle-inner-right"></div>
      </div>
    </div>
    <div
      class="not-found-font not-found-font-bottom"
      :style="{ color: isLightOn ? 'black' : 'white' }"
    >
      <a>{{ font.font2 }}</a>
      <p>{{ font.font3 }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { createAnimatable } from "animejs";

// 定义鼠标移动和刷新边界的函数
let onMouseMove: (e: MouseEvent) => void;
let refreshBounds: () => void;

// 处理眼睛动画的函数
const handleEyeAnimation = (
  e: MouseEvent,
  bounds: DOMRect,
  animatable: any,
  limitRange: number
) => {
  const { width, height, left, top } = bounds;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const xRaw = e.clientX - left - halfWidth;
  const yRaw = e.clientY - top - halfHeight;
  const distance = Math.sqrt(xRaw ** 2 + yRaw ** 2);

  if (distance > halfWidth * limitRange && distance > halfHeight * limitRange) {
    const ratio = (halfWidth * limitRange) / distance;
    const x = xRaw * ratio;
    const y = yRaw * ratio;
    animatable.x(x);
    animatable.y(y);
  } else {
    animatable.x(xRaw);
    animatable.y(yRaw);
  }
};

onMounted(() => {
  // 定义眼睛移动的限制范围
  const limitRange = 0.7;
  // 获取左右眼元素
  const leftEye = document.querySelector(".not-found-eye-circle-left");
  const rightEye = document.querySelector(".not-found-eye-circle-right");
  if (!leftEye || !rightEye) return;

  // 获取左右眼元素的边界信息
  let leftBounds = leftEye.getBoundingClientRect();
  let rightBounds = rightEye.getBoundingClientRect();

  // 创建左右眼动画对象
  const leftAnimatable = createAnimatable(".not-found-eye-circle-inner-left", {
    x: 500,
    y: 500,
    ease: "out(3)",
  });
  const rightAnimatable = createAnimatable(".not-found-eye-circle-inner-right", {
    x: 500,
    y: 500,
    ease: "out(3)",
  });

  // 刷新左右眼元素的边界信息
  refreshBounds = () => {
    leftBounds = leftEye.getBoundingClientRect();
    rightBounds = rightEye.getBoundingClientRect();
  };

  // 处理鼠标移动事件
  onMouseMove = (e: MouseEvent) => {
    handleEyeAnimation(e, leftBounds, leftAnimatable, limitRange);
    handleEyeAnimation(e, rightBounds, rightAnimatable, limitRange);
  };

  // 添加鼠标移动和窗口大小改变事件监听器
  document.addEventListener("mousemove", onMouseMove);
  window.addEventListener("resize", refreshBounds);
});

onUnmounted(() => {
  // 移除鼠标移动和窗口大小改变事件监听器
  document.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("resize", refreshBounds);
});

// 定义页面显示的文字内容
const font = reactive({
  font1: "404 Not Found",
  font2: "WHO TURNED OFF THE LIGHT?",
  font3: "灯关了,你不会在这找到任何东西.",
});

// 定义灯的开关状态
const isLightOn = ref(false);

// 处理灯绳点击事件
const toggleLight = () => {
  isLightOn.value = !isLightOn.value;
  if (isLightOn.value) {
    font.font2 = "WHO TURNED ON THE LIGHT?";
    font.font3 = "灯开了,我的眼睛快要被它亮瞎了.";
  } else {
    font.font2 = "WHO TURNED OFF THE LIGHT?";
    font.font3 = "灯关了,我不在这找任何东西.";
  }
};
</script>

<style scoped>
body {
  margin: 0;
}

/* 包裹左右眼的容器样式 */
.not-found {
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  transition: background-color 0.5s ease;
  background-color: black;
}

.not-found-font {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: color 0.5s ease;
  color: white;
}

.not-found-font-top {
  height: 33%;
  justify-content: flex-end;
  /* 文字靠下 */
  font-size: 60px;
  font-family: "Courier New", Courier, monospace;
  font-weight: bold;
}

.not-found-eye {
  height: 30%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 40px;
}

.not-found-eye-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  transition: background-color 0.5s ease;
}

.not-found-eye-circle-inner {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: black;
}

.not-found-font-bottom {
  height: 37%;
  justify-content: flex-start;
  /* 文字靠上 */
  font-size: 30px;
  font-weight: bold;
  font-family: Courier, monospace;
}

@media (max-height: 400px) {
  .not-found-eye {
    display: none;
  }
}

@media (max-height: 200px) {
  .not-found-eye {
    display: none;
  }

  .not-found-font-bottom {
    display: none;
  }

  .not-found-font-top {
    height: 100%;
    justify-content: center;
  }
}

/* 灯绳样式 */
.light-rope {
  position: absolute;
  top: 0;
  left: 90%;
  transform: translateX(-50%);
  width: 10px;
  height: 100px;
  background: linear-gradient(45deg, #8b4513 0%, #a0522d 50%, #8b4513 100%);
  border-radius: 0 0 5px 5px;
  box-shadow: inset 0 -2px 5px rgba(0, 0, 0, 0.3), 0 2px 5px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.light-rope:hover {
  transform: translateX(-50%) scaleY(1.5);
}
</style>
