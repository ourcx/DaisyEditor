<template>
  <div class="sub-menu-section">
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium">文本设置</span>
      <Button icon="pi pi-times" text rounded @click="$emit('cancel')" />
    </div>

    <div class="text-controls">
      <div class="control-group">
        <label class="control-label">文本内容</label>
        <InputText v-model="textModel" placeholder="输入文本内容" class="w-full" />
      </div>

      <div class="control-group">
        <label class="control-label">字体大小</label>
        <InputNumber 
          v-model="sizeModel" 
          :min="8" 
          :max="72" 
          :step="2" 
          showButtons 
          buttonLayout="horizontal"
          class="w-full" 
        />
      </div>

      <div class="control-group">
        <label class="control-label">字体粗细</label>
        <Dropdown 
          v-model="weightModel" 
          :options="fontWeightOptions" 
          optionLabel="label" 
          optionValue="value"
          class="w-full" 
        />
      </div>

      <div class="card flex flex-wrap justify-center gap-4">
        <div class="flex items-center gap-2">
          <Checkbox 
            v-model="biusModel" 
            inputId="ingredient1" 
            name="pizza" 
            value="Bold" 
          />
          <label for="ingredient1"> 加粗 </label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox 
            v-model="biusModel" 
            inputId="ingredient2" 
            name="pizza" 
            value="Italic" 
          />
          <label for="ingredient2"> 斜体 </label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox 
            v-model="biusModel" 
            inputId="ingredient3" 
            name="pizza" 
            value="Underline" 
          />
          <label for="ingredient3"> 下划线 </label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox 
            v-model="biusModel" 
            inputId="ingredient4" 
            name="pizza" 
            value="Strikethrough" 
          />
          <label for="ingredient4"> 删除线 </label>
        </div>
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
  text: string;
  size: number;
  weight: string;
  bius: any;
}

interface Emits {
  (e: 'update:text', value: string): void;
  (e: 'update:size', value: number): void;
  (e: 'update:weight', value: string): void;
  (e: 'update:bius', value: any): void;
  (e: 'apply'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '100', value: '100' },
  { label: '200', value: '200' },
  { label: '300', value: '300' },
  { label: '400', value: '400' },
  { label: '500', value: '500' },
  { label: '600', value: '600' },
  { label: '700', value: '700' },
  { label: '800', value: '800' },
  { label: '900', value: '900' }
];

const textModel = computed({
  get: () => props.text,
  set: (value) => emit('update:text', value)
});

const sizeModel = computed({
  get: () => props.size,
  set: (value) => emit('update:size', value)
});

const weightModel = computed({
  get: () => props.weight,
  set: (value) => emit('update:weight', value)
});

const biusModel = computed({
  get: () => props.bius,
  set: (value) => emit('update:bius', value)
});
</script>

<style scoped>
.text-controls {
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