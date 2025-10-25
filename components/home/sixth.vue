<template>
  <!-- 内容区域 -->
  <div class="content-wrapper">
    <!-- 图片区域 -->
    <div class="image-section">
      <div class="image-container">
        <Image :src="url" alt="项目展示" class="feature-image" preview />
        <div class="image-overlay">
          <div class="overlay-content">
            <i class="pi pi-search-plus overlay-icon"></i>
            <span>{{ title }}</span>
          </div>
        </div>
        <div class="image-frame"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  url?: string;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  url: "https://s2.loli.net/2025/06/14/Vghe4OEkcGvUY9n.png",
  title: "项目展示",
});
</script>

<style scoped lang="scss">
// 内容布局
.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

// 图片区域
.image-section {
  .image-container {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    transform: perspective(1000px) rotateY(-5deg);
    transition: all 0.3s ease;

    &:hover {
      transform: perspective(1000px) rotateY(0deg) scale(1.02);

      .image-overlay {
        opacity: 1;
      }
    }

    .feature-image {
      width: 100%;
      height: auto;
      display: block;
      transition: all 0.3s ease;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s ease;

      .overlay-content {
        text-align: center;
        color: white;

        .overlay-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        span {
          font-size: 1.1rem;
        }
      }
    }

    .image-frame {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 15px;
      pointer-events: none;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .sixth-title-container {
    padding: 1rem;
  }

  .title-header .main-title {
    flex-direction: column;
    gap: 0.5rem;

    .title-number {
      font-size: 3rem;
    }

    .title-text {
      font-size: 2rem;
    }
  }

  .content-wrapper {
    gap: 1.5rem;
  }

  .image-section .image-container {
    transform: none;

    &:hover {
      transform: scale(1.02);
    }
  }
}
</style>
