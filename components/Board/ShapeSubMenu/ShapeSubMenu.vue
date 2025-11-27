<template>
  <div class="sub-menu-section">
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium">选择形状</span>
      <Button icon="pi pi-times" text rounded @click="$emit('cancel')" />
    </div>
    <div class="shape-grid">
      <div 
        v-for="shape in availableShapes" 
        :key="shape.id" 
        class="shape-item"
        :class="{ active: shape.id === selectedShape }" 
        @click="selectShape(shape.id)"
      >
        <div class="shape-preview" :class="`shape-${shape.id}`"></div>
        <span class="shape-label">{{ shape.label }}</span>
      </div>
    </div>
    <div class="flex gap-2 mt-3">
      <Button label="应用" size="small" @click="$emit('apply')" />
      <Button label="取消" severity="secondary" size="small" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Shape } from '~/types/components/type';
import type { MenuData } from '~/types/type';



interface Props {
  shape: Shape;
}

interface Emits {
  (e: 'update:shape', value: Shape): void;
  (e: 'apply'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const availableShapes: MenuData[] = [
  { id: 'circle', label: '圆形', icon: 'pi pi-circle' },
  { id: 'Rect', label: '矩形', icon: 'pi pi-square' },
  { id: 'Line', label: '线条', icon: 'pi pi-minus' },
  { id: 'Text', label: '文本', icon: 'pi pi-font' },
  { id: 'Curve', label: '曲线', icon: 'pi pi-chart-line' },
  { id: 'Area', label: '区域', icon: 'pi pi-objects-column' },
  { id: 'Arc', label: '弧形', icon: 'pi pi-arrow-right-arrow-left' },
  { id: 'Pie', label: '饼图', icon: 'pi pi-chart-pie' }
];

const selectedShape = ref<Shape>(props.shape);

const selectShape = (shapeId: Shape) => {
  selectedShape.value = shapeId;
  emit('update:shape', shapeId);
};

watch(() => props.shape, (newShape) => {
  selectedShape.value = newShape;
});
</script>

<style scoped>
.shape-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.shape-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shape-item:hover {
  background: #f3f4f6;
}

.shape-item.active {
  background: #3b82f6;
  color: white;
}

.shape-preview {
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  border: 2px solid currentColor;
}

.shape-circle {
  border-radius: 50%;
}

.shape-Rect {
  border-radius: 4px;
}

.shape-Line {
  width: 24px;
  height: 2px;
  background: currentColor;
  margin: 15px 0;
}

.shape-Text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.shape-Curve {
  position: relative;
  overflow: hidden;
}

.shape-Curve::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transform: translateY(-50%);
}

.shape-label {
  font-size: 10px;
  text-align: center;
}
</style>