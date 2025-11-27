<template>
  <div class="sub-menu-section z-2">
    <div class="flex items-center justify-between mb-3 relative">
      <span class="text-sm font-medium">图片设置</span>
      <Button icon="pi pi-times" text rounded @click="$emit('cancel')" />
    </div>

    <!-- 当前图片预览 -->
    <div v-if="currentImage" class="image-preview mb-4">
      <div class="preview-container border rounded p-2 bg-gray-50">
        <img 
          :src="currentImage" 
          :style="{ filter: getFilterStyle(currentFilter) }"
          class="max-w-full h-20 object-contain mx-auto" 
          alt="当前图片" 
        />
      </div>
    </div>

    <div class="image-controls flex flex-col gap-3 mb-4">
      <!-- 上传图片按钮 -->
      <div class="upload-section">
        <label class="block text-xs font-medium mb-2 text-gray-700">上传新图片</label>
        <input 
          type="file" 
          ref="fileInputRef" 
          accept="image/*" 
          @change="handleFileUpload" 
          class="hidden" 
        />
        <Button 
          label="选择图片" 
          icon="pi pi-upload" 
          size="small" 
          @click="triggerFileInput" 
          class="w-full" 
        />
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2 justify-between">
        <Button 
          label="取消" 
          severity="secondary" 
          size="small" 
          @click="$emit('cancel')" 
          class="flex-1" 
        />
        <Button 
          v-if="currentImage" 
          label="删除图片" 
          severity="danger" 
          size="small" 
          @click="$emit('delete')"
          class="flex-1" 
        />
      </div>
    </div>

    <!-- 更改滤镜 -->
    <div class="filter-controls z-bar relative">
      <label class="block text-xs font-medium mb-2 text-gray-700 z-bar">滤镜效果</label>
      <Select 
        v-model="filterModel" 
        :options="filters" 
        optionLabel="name" 
        optionValue="code" 
        placeholder="选择滤镜"
        class="w-full" 
        @update:modelValue="$emit('filter-change', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { filter as Filter } from '~/types/components/type';

interface Props {
  currentImage: string;
  currentFilter: Filter;
  filter: Filter;
}

interface Emits {
  (e: 'update:filter', value: Filter): void;
  (e: 'upload', file: File): void;
  (e: 'delete'): void;
  (e: 'filter-change', value: Filter): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileInputRef = ref<HTMLInputElement | null>(null);

type SelectFilter = {
  name: string;
  code: Filter;
}

const filters = ref<SelectFilter[]>([
  { name: '模糊', code: 'blur' },
  { name: '灰度', code: 'grayscale' },
  { name: '反色', code: 'invert' },
  { name: '无色', code: 'none' },
]);

const filterModel = computed({
  get: () => props.filter,
  set: (value) => emit('update:filter', value)
});

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    emit('upload', file);
    // 重置文件输入
    if (target) target.value = '';
  }
};

const getFilterStyle = (filterType: Filter) => {
  switch (filterType) {
    case 'blur':
      return 'blur(2px)';
    case 'grayscale':
      return 'grayscale(100%)';
    case 'invert':
      return 'invert(100%)';
    default:
      return 'none';
  }
};
</script>

<style scoped>
.image-preview .preview-container {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-section {
  border: 2px dashed #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  transition: border-color 0.3s ease;
}

.upload-section:hover {
  border-color: #3b82f6;
}
</style>