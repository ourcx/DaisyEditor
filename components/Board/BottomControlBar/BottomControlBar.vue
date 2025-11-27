<template>
  <div class="fixed bottom-4 right-4 text-white flex items-center justify-center gap-2 z-bar">
    <Button 
      icon="pi pi-chevron-left" 
      class="p-2 bg-black/70 hover:bg-black/80 rounded text-white" 
      @click="$emit('undo')" 
      :disabled="!canUndo" 
    />
    
    <Button 
      icon="pi pi-chevron-right" 
      class="p-2 bg-black/70 hover:bg-black/80 rounded text-white"
      @click="$emit('redo')" 
      :disabled="!canRedo" 
    />

    <div class="bg-black/70 rounded text-xs flex items-center justify-center gap-1">
      <Button 
        icon="pi pi-search-plus" 
        class="hover:bg-black/80 rounded text-white bg-transparent" 
        @click="$emit('zoomIn')" 
      />
      <div class="pl-1 pr-1">
        Scale: {{ transform.scale.toFixed(2) }} | X:
        {{ transform.x.toFixed(0) }} | Y:
        {{ transform.y.toFixed(0) }}
      </div>
      <Button 
        icon="pi pi-search-minus" 
        class="hover:bg-black/80 rounded text-white bg-transparent"
        @click="$emit('zoomOut')" 
      />
    </div>
    
    <Button @click="$emit('toggleGuides')" class="">辅助线开关</Button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  transform: { x: number; y: number; scale: number };
  canUndo: boolean;
  canRedo: boolean;
}

interface Emits {
  (e: 'zoomIn'): void;
  (e: 'zoomOut'): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'toggleGuides'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>