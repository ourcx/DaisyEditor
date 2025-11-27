<template>
  <Teleport to="body">
    <div v-if="visible" class="global-floating-menu" :style="menuStyle" @click.stop>
      <div class="floating-menu-content">
        <!-- 子菜单内容 -->
        <ColorSubMenu 
          v-if="currentSubMenu === 'color'"
          v-model:color="colorValue"
          @apply="applyColorChange"
          @cancel="closeSubMenu"
        />
        
        <ShapeSubMenu 
          v-else-if="currentSubMenu === 'shape'"
          v-model:shape="selectedShape"
          @apply="applyShapeChange"
          @cancel="closeSubMenu"
        />
        
        <BorderSubMenu 
          v-else-if="currentSubMenu === 'border'"
          v-model:width="borderWidth"
          v-model:color="borderColor"
          @apply="applyBorderChange"
          @cancel="closeSubMenu"
        />
        
        <ImageSubMenu 
          v-else-if="currentSubMenu === 'image'"
          :current-image="currentPageImage"
          :current-filter="currentPageFilter"
          v-model:filter="filter"
          @upload="handleImageUpload"
          @delete="deleteImage"
          @filter-change="handleFilterChange"
          @cancel="closeSubMenu"
        />
        
        <TextSubMenu 
          v-else-if="currentSubMenu === 'text'"
          v-model:text="textContent"
          v-model:size="textSize"
          v-model:weight="textWeight"
          v-model:bius="BIUS"
          @apply="applyTextChange"
          @cancel="closeSubMenu"
        />
        
        <!-- 主菜单 -->
        <MainMenu 
          v-else
          :current-page-type="currentPageType"
          @action="handleMainMenuAction"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { WhithBoardItemProps as WhithBoardProps } from '~/types/type';
import type { Shape, filter as Filter } from '~/types/components/type';

interface Props {
  visible: boolean;
  position: { x: number; y: number };
  currentPageId: number | null;
  currentPageType: string;
  pages: WhithBoardProps[];
}

interface Emits {
  (e: 'close'): void;
  (e: 'action', action: string, data?: any): void;
  (e: 'save', summary: string, detail: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 子组件
import ColorSubMenu from '../Board/FloatingMenu/ColorSubMenu.vue';
import ShapeSubMenu from '../Board/ShapeSubMenu/ShapeSubMenu.vue';
import BorderSubMenu from '../Board/BorderSubMenu/BorderSubMenu.vue';
import ImageSubMenu from '../Board/ImageSubMenu/ImageSubMenu.vue';
import TextSubMenu from '../Board/TextSubMenu/TextSubMenu.vue';
import MainMenu from '../Board/MainMenu/MainMenu.vue';

// 状态
const currentSubMenu = ref<string | null>(null);
const colorValue = ref<string>('e3f2fd');
const selectedShape = ref<Shape>('circle');
const borderWidth = ref<number>(1);
const borderColor = ref<string>('2196f3');
const textContent = ref<string>('文本');
const textSize = ref<number>(16);
const textWeight = ref<string>('normal');
const BIUS = ref();
const filter = ref<Filter>('none');

import type { CSSProperties } from 'vue';

const menuStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  zIndex: 10000,
}));

const currentPageImage = computed(() => {
  if (props.currentPageId) {
    const page = props.pages.find(p => p.id === props.currentPageId);
    return page?.image || '';
  }
  return '';
});

const currentPageFilter = computed(() => {
  if (props.currentPageId) {
    const page = props.pages.find(p => p.id === props.currentPageId);
    return page?.filter || 'none';
  }
  return 'none';
});

// 方法
const closeSubMenu = () => {
  currentSubMenu.value = null;
};

const handleMainMenuAction = (action: string) => {
  if (action === 'change-color') {
    currentSubMenu.value = 'color';
  } else if (action === 'change-shape') {
    currentSubMenu.value = 'shape';
  } else if (action === 'change-border') {
    currentSubMenu.value = 'border';
  } else if (action === 'change-text') {
    currentSubMenu.value = 'text';
  } else if (action === 'image-setting') {
    currentSubMenu.value = 'image';
  } else {
    emit('action', action);
  }
};

// 应用更改的方法
const applyColorChange = () => {
  emit('action', 'update-color', { color: colorValue.value });
  emit('save', '颜色', '页面颜色已更新');
  closeSubMenu();
};

const applyShapeChange = () => {
  emit('action', 'update-shape', { shape: selectedShape.value });
  emit('save', '形状', `图形已更改为${selectedShape.value}`);
  closeSubMenu();
};

const applyBorderChange = () => {
  emit('action', 'update-border', { 
    width: borderWidth.value, 
    color: borderColor.value 
  });
  emit('save', '边框', '边框设置已更新');
  closeSubMenu();
};

const applyTextChange = () => {
  emit('action', 'update-text', {
    text: textContent.value,
    size: textSize.value,
    weight: textWeight.value,
    bius: BIUS.value
  });
  emit('save', '文本', '文本设置已更新');
  BIUS.value = {};
  closeSubMenu();
};

const handleImageUpload = (file: File) => {
  emit('action', 'upload-image', { file });
};

const deleteImage = () => {
  emit('action', 'delete-image');
  emit('save', '图片', '图片已删除');
  filter.value = 'none';
  closeSubMenu();
};

const handleFilterChange = (newFilter: Filter) => {
  emit('action', 'update-filter', { filter: newFilter });
};
</script>

<style scoped>
.global-floating-menu {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  backdrop-filter: blur(8px);
}

.floating-menu-content {
  padding: 8px;
  min-width: 180px;
}
</style>