<template>
  <div class="video-player">
    <div class="video-container">
      <div class="video-wrapper">
        <video
          ref="videoPlayer"
          muted
          playsinline
          :poster="posterImage"
          :style="videoStyle"
          class="video-element"
          @loadedmetadata="onVideoLoad"
          @play="onVideoPlay"
          @pause="onVideoPause"
          @ended="onVideoEnd"
        >
          <source :src="videoSource" type="video/mp4" />
          您的浏览器不支持视频播放。
        </video>

        <!-- 自定义播放控件 -->
        <div class="custom-controls" v-if="showCustomControls">
          <div class="controls-top">
            <button class="control-btn" @click="toggleFullscreen" aria-label="全屏">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M3 3v4h1V4h3V3H3zm0 10h4v-1H4v-3H3v4zm10 0v-4h-1v3h-3v1h4zm0-10h-4v1h3v3h1V3z"
                />
              </svg>
            </button>
          </div>

          <div class="controls-bottom">
            <div class="playback-controls">
              <button
                class="control-btn"
                @click="togglePlay"
                :aria-label="isPlaying ? '暂停' : '播放'"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path v-if="!isPlaying" d="M8 5v10l7-5z" />
                  <path v-else d="M6 4h2v12H6zm6 0h2v12h-2z" />
                </svg>
              </button>

              <div class="progress-container" @click="seekTo">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: progress + '%' }"></div>
                  <div class="progress-thumb" :style="{ left: progress + '%' }"></div>
                </div>
              </div>

              <div class="time-display">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div class="loading-indicator" v-if="isLoading">
          <div class="spinner"></div>
        </div>

        <!-- 播放按钮覆盖层 -->
        <div class="play-overlay" v-if="!isPlaying && !isLoading" @click="togglePlay">
          <button class="play-button" aria-label="播放视频">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="currentColor">
              <circle cx="30" cy="30" r="28" fill="rgba(0,0,0,0.7)" />
              <path d="M25 20v20l14-10z" fill="white" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";

// 组件属性
interface Props {
  videoSource?: string;
  posterImage?: string;
  aspectRatio?: number;
  autoPlay?: boolean;
  showControls?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  posterImage: "",
  aspectRatio: 1.4947368421052631,
  autoPlay: true,
  showControls: true,
  videoSource: "https://vjs.zencdn.net/v/oceans.mp4",
});

// 响应式数据
const videoPlayer = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const isLoading = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);
const showCustomControls = ref(false);
const isFullscreen = ref(false);

// 计算属性
const videoStyle = computed(() => ({
  aspectRatio: props.aspectRatio.toString(),
}));

// 方法
const togglePlay = () => {
  if (!videoPlayer.value) return;

  if (isPlaying.value) {
    videoPlayer.value.pause();
  } else {
    videoPlayer.value.play();
  }
};

const toggleFullscreen = () => {
  if (!videoPlayer.value) return;

  if (!document.fullscreenElement) {
    if (videoPlayer.value.requestFullscreen) {
      videoPlayer.value.requestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

const seekTo = (event: MouseEvent) => {
  if (!videoPlayer.value) return;

  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  videoPlayer.value.currentTime = percent * duration.value;
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const onVideoLoad = () => {
  if (videoPlayer.value) {
    duration.value = videoPlayer.value.duration;
  }
};

const onVideoPlay = () => {
  isPlaying.value = true;
  isLoading.value = false;
};

const onVideoPause = () => {
  isPlaying.value = false;
};

const onVideoEnd = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  progress.value = 0;
};

// 生命周期
onMounted(() => {
  if (!videoPlayer.value) return;

  // 设置自动播放
  if (props.autoPlay) {
    videoPlayer.value.play().catch((e) => {
      console.log("自动播放被阻止:", e);
    });
  }

  // 更新进度
  const updateProgress = () => {
    if (videoPlayer.value) {
      currentTime.value = videoPlayer.value.currentTime;
      progress.value = (currentTime.value / duration.value) * 100;
    }
  };

  // 监听时间更新
  videoPlayer.value.addEventListener("timeupdate", updateProgress);

  // 监听加载开始
  videoPlayer.value.addEventListener("loadstart", () => {
    isLoading.value = true;
  });

  // 监听可以播放
  videoPlayer.value.addEventListener("canplay", () => {
    isLoading.value = false;
  });

  // 监听全屏变化
  document.addEventListener("fullscreenchange", () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

onUnmounted(() => {
  // 清理事件监听器
  if (videoPlayer.value) {
    videoPlayer.value.pause();
  }
});
</script>

<style scoped lang="scss">
.video-player {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-bottom: 10%;

  .video-container {
    width: 70%;
  }

  .video-wrapper {
    line-height: 0;
    max-width: 100%;
    position: relative;
    z-index: 1;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 10px 10px rgba(0, 0, 0);
    background-color: #000;

    &:hover .custom-controls {
      opacity: 1;
    }
  }

  .video-element {
    width: 100%;
    height: auto;
    display: block;
    background-color: #000;
    border: 5px solid rgba(0, 0, 0);
  }

  .custom-controls {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.4) 0%,
      transparent 20%,
      transparent 70%,
      rgba(0, 0, 0, 0.6) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;

    & > * {
      pointer-events: auto;
    }

    .controls-top {
      display: flex;
      justify-content: flex-end;
      padding: 12px;
    }

    .controls-bottom {
      padding: 12px;
    }

    .playback-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .control-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      svg {
        display: block;
      }
    }

    .progress-container {
      flex: 1;
      height: 20px;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .progress-bar {
      position: relative;
      width: 100%;
      height: 4px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      overflow: visible;
    }

    .progress-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: #fff;
      border-radius: 2px;
      transition: width 0.1s linear;
    }

    .progress-thumb {
      position: absolute;
      top: 50%;
      width: 12px;
      height: 12px;
      background-color: #fff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .progress-container:hover {
      .progress-thumb {
        opacity: 1;
      }

      .progress-bar {
        height: 6px;
      }
    }

    .time-display {
      color: white;
      font-size: 12px;
      min-width: 80px;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
    }
  }

  .loading-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.5);

      .play-button svg circle {
        fill: rgba(0, 0, 0, 0.8);
      }
    }

    .play-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .video-player {
    padding: 0.5rem;

    .custom-controls {
      opacity: 1; // 在移动设备上始终显示控件
    }

    .play-overlay .play-button svg {
      width: 50px;
      height: 50px;
    }
  }
}
</style>
