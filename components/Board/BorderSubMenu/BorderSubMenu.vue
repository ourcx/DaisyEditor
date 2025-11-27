<template>
  <div class="sub-menu-section">
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium">边框设置</span>
      <Button icon="pi pi-times" text rounded @click="$emit('cancel')" />
    </div>

    <div class="border-controls">
      <div class="control-group">
        <label class="control-label">边框宽度</label>
        <InputNumber 
          v-model="widthModel" 
          :min="0" 
          :max="10" 
          :step="1" 
          showButtons 
          buttonLayout="horizontal"
          class="w-full" 
        />
      </div>

      <div class="control-group">
        <label class="control-label">边框颜色</label>
        <ColorPicker v-model="colorModel" format="hex" />
      </div>
    </div>

    <div class="flex gap-2 mt-3">
      <Button label="应用" size="small" @click="$emit('apply')" />
      <Button label="取消" severity="secondary" size="small" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  width: number;
  color: string;
}

interface Emits {
  (e: 'update:width', value: number): void;
  (e: 'update:color', value: string): void;
  (e: 'apply'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const widthModel = computed({
  get: () => props.width,
  set: (value) => emit('update:width', value)
});

const colorModel = computed({
  get: () => props.color,
  set: (value) => emit('update:color', value)
});
</script>

<style scoped>
.border-controls {
  max-height: 300px;
  overflow-y: auto;
}

.control-group {
  margin-bottom: 12px;
}

.control-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #374151;
}
</style>