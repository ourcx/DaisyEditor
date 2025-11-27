<template>
  <div v-if="visible" class="fixed top-4 right-4 bg-white border border-gray-300 p-3 rounded-lg shadow-lg minimap w-64 h-96">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-gray-700">导航地图</span>
      <div class="flex space-x-1">
        <button @click="$emit('zoomIn')" class="p-1 rounded hover:bg-gray-200 text-gray-600" title="放大">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
        <button @click="$emit('zoomOut')" class="p-1 rounded hover:bg-gray-200 text-gray-600" title="缩小">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          </svg>
        </button>
        <button @click="$emit('refresh')" class="p-1 rounded hover:bg-gray-200 text-gray-600" title="刷新">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
            </path>
          </svg>
        </button>
        <button @click="$emit('toggle')" class="p-1 rounded hover:bg-gray-200 text-gray-600" title="隐藏">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="slider w-full relative border border-gray-200 rounded overflow-hidden bg-white">
      <iframe class="slider__content w-full h-full border-none" ref="targetIframe" sandbox="allow-same-origin" @load="onIframeLoad" />

      <div
        class="absolute border-2 border-red-500 bg-red-200 bg-opacity-20 pointer-events-none transition-all duration-200"
        :style="viewportIndicatorStyle"
      ></div>
    </div>
  </div>

  <button 
    v-else 
    @click="$emit('toggle')"
    class="fixed top-4 right-4 p-2 bg-primary-500 text-white rounded-lg shadow-lg hover:bg-red-400 transition-colors"
    title="显示导航地图"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7">
      </path>
    </svg>
  </button>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean;
  zoom: number;
  transform: { x: number; y: number; scale: number };
  containerRef: HTMLElement | null;
}

interface Emits {
  (e: 'zoomIn'): void;
  (e: 'zoomOut'): void;
  (e: 'refresh'): void;
  (e: 'toggle'): void;
  (e: 'navigate', x: number, y: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const targetIframe = ref<HTMLIFrameElement | null>(null);

const viewportIndicatorStyle = computed(() => {
  if (!props.containerRef) return {};

  const containerRect = props.containerRef.getBoundingClientRect();
  const viewportWidth = containerRect.width / props.transform.scale;
  const viewportHeight = containerRect.height / props.transform.scale;

  const viewportX = -props.transform.x / props.transform.scale;
  const viewportY = -props.transform.y / props.transform.scale;

  const indicatorX = viewportX * props.zoom;
  const indicatorY = viewportY * props.zoom;
  const indicatorWidth = viewportWidth * props.zoom;
  const indicatorHeight = viewportHeight * props.zoom;

  return {
    left: `${indicatorX}px`,
    top: `${indicatorY}px`,
    width: `${indicatorWidth}px`,
    height: `${indicatorHeight}px`,
  };
});

const onIframeLoad = () => {
  if (!targetIframe.value || !targetIframe.value.contentDocument) return;

  const iframeDoc = targetIframe.value.contentDocument;
  
  iframeDoc.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    const rect = iframeDoc.documentElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    emit('navigate', x, y);
  });

  iframeDoc.addEventListener('mousemove', () => {
    iframeDoc.body.style.cursor = 'pointer';
  });
};
</script>

<style scoped>
.minimap {
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.slider {
  width: 100%;
  height: 90%;
}

.slider__content {
  width: 100%;
  height: 100%;
  background: white;
}
</style>