<template>
  <div ref="canvasRef" class="canvas" :style="canvasStyle">
    <div 
      v-for="(page, index) in pages" 
      :key="index" 
      :data-id="`id-key-${page.id}`" 
      :id="`${page.id}`"
      class="absolute rounded-lg cursor-pointer select-none duration-200 page-item overflow-visible" 
      :style="getPageStyle(page)"
      @click="handlePageClick($event, page)" 
      draggable="true"
    >
      <BoardItem 
        :width="page.rect.width" 
        :height="page.rect.height" 
        :cx="page.rect.width" 
        :cy="page.rect.height"
        :boxshow="highRectList.has(`id-key-${page.id}`)" 
        :id="page.id" 
        @update:size="handleSizeUpdate"
        :scaleX="page.rect.scaleX" 
        :scaleY="page.rect.scaleY" 
        :color="page.background" 
        :shape="page.type"
        :strokeColor="page.borderColor" 
        :strokeWidth="page.borderWidth" 
        :image="page.image || ''" 
        :text="page.text"
        :textSize="page.textSize" 
        :textWeight="page.textWeight" 
        :filter="page.filter"
        @resize-start="handleResizeStart($event, page)" 
        :BIUSArr="page.BIUSArr" 
      />

      <Button 
        icon="pi pi-equals" 
        severity="secondary" 
        variant="text" 
        raised 
        rounded 
        aria-label="Bookmark"
        class="floating-trigger" 
        @click.stop="toggleFloatingMenu($event, page)"
        @mousedown.stop="handleRotateStart($event, page)" 
        :pt="floatingButtonStyle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WhithBoardItemProps as WhithBoardProps } from '~/types/type';
import type { CSSProperties } from 'vue';

interface Props {
  pages: WhithBoardProps[];
  transform: { x: number; y: number; scale: number };
  highRectList: Set<string>;
}

interface Emits {
  (e: 'page-click', event: MouseEvent, page: WhithBoardProps): void;
  (e: 'size-update', newScale: any, id: number): void;
  (e: 'resize-start', payload: any, page: any): void;
  (e: 'rotate-start', event: MouseEvent, page: any): void;
  (e: 'toggle-floating-menu', event: MouseEvent, page: WhithBoardProps): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const canvasRef = ref<HTMLElement | null>(null);

const canvasStyle = computed<CSSProperties>(() => ({
  transform: `translate(${props.transform.x}px, ${props.transform.y}px) scale(${props.transform.scale})`,
  transformOrigin: '0 0',
  width: '0px',
  height: '0px',
  position: 'absolute',
  top: '0',
  left: '0',
  overflow: 'visible'
}));

const floatingButtonStyle = {
  root: {
    style: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      width: '32px',
      height: '32px',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      zIndex: 20,
      opacity: 0,
      transition: 'opacity 0.2s ease',
    },
  },
};

const getPageStyle = (page: WhithBoardProps): CSSProperties => ({
  top: page.rect.y + 'px',
  left: page.rect.x + 'px',
  pointerEvents: 'auto', // 明确设置为合法的 PointerEvents 值
  zIndex: 10,
  width: page.rect.width + 'px',
  height: page.rect.height + 'px',
  transform: `rotate(${page.rotate})`,
  transformOrigin: 'center',
  padding: '10px'
});
const handlePageClick = (event: MouseEvent, page: WhithBoardProps) => {
  emit('page-click', event, page);
};

const handleSizeUpdate = (newScale: any, id: number) => {
  emit('size-update', newScale, id);
};

const handleResizeStart = (payload: any, page: any) => {
  emit('resize-start', payload, page);
};

const handleRotateStart = (event: MouseEvent, page: any) => {
  emit('rotate-start', event, page);
};

const toggleFloatingMenu = (event: MouseEvent, page: WhithBoardProps) => {
  emit('toggle-floating-menu', event, page);
};
</script>

<style scoped>
.page-item:hover .floating-trigger {
  opacity: 1 !important;
}
</style>