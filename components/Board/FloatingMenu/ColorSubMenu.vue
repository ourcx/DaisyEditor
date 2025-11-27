<template>
  <div class="sub-menu-section">
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium">选择颜色</span>
      <Button icon="pi pi-times" text rounded @click="$emit('cancel')" />
    </div>
    <ColorPicker v-model="colorModel" format="hex" />
    <div class="flex gap-2 mt-3">
      <Button label="应用" size="small" @click="$emit('apply')" />
      <Button label="取消" severity="secondary" size="small" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  color: string;
}

interface Emits {
  (e: 'update:color', value: string): void;
  (e: 'apply'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const colorModel = computed({
  get: () => props.color,
  set: (value) => emit('update:color', value)
});
</script>