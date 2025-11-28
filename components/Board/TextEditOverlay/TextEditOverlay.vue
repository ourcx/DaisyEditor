<template>
  <div v-if="visible" class="text-edit-overlay" @mousedown="handleOverlayClick">
    <div 
      class="text-edit-container" 
      :style="containerStyle"
      @mousedown.stop
    >
      <textarea
        ref="textEditTextarea"
        v-model="editingText"
        @keydown="handleKeydown"
        @blur="handleBlur"
        :style="textareaStyle"
        :placeholder="placeholder"
        autofocus
      />
      <div class="text-edit-toolbar">
        <button @click="handleConfirm" class="toolbar-btn confirm" title="确认 (Enter)">
          确定
        </button>
        <button @click="handleCancel" class="toolbar-btn cancel" title="取消 (Esc)">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';

interface Props {
  visible: boolean;
  position: { x: number; y: number };
  text: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  fontStyle?: string;
  textDecoration?: string;
  placeholder?: string;
  width?: number;
  height?: number;
}

interface Emits {
  (e: 'confirm', text: string): void;
  (e: 'cancel'): void;
  (e: 'update:visible', visible: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 16,
  fontWeight: 'normal',
  color: '#000000',
  fontStyle: 'normal',
  textDecoration: 'none',
  placeholder: '请输入文本...',
  width: 300,
  height: 120
});

const emit = defineEmits<Emits>();

const textEditTextarea = ref<HTMLTextAreaElement>();
const editingText = ref(props.text);

// 计算样式
const containerStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  width: `${props.width}px`,
  minHeight: `${props.height/2}px`
}));

const textareaStyle = computed(() => ({
  fontSize: `${props.fontSize}px`,
  fontWeight: props.fontWeight,
  fontStyle: props.fontStyle,
  textDecoration: props.textDecoration,
  minHeight: `${props.height - 80}px` // 减去工具栏高度
}));

// 自动聚焦
const focusTextarea = async () => {
  await nextTick();
  if (textEditTextarea.value) {
    textEditTextarea.value.focus();
    textEditTextarea.value.select();
  }
};

// 处理按键
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleConfirm();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    handleCancel();
  }
};

// 处理失去焦点
const handleBlur = () => {
  // 延迟处理，以便点击工具栏按钮时不会立即关闭
  setTimeout(() => {
    if (document.activeElement !== textEditTextarea.value) {
      handleConfirm();
    }
  }, 100);
};

// 处理确认
const handleConfirm = () => {
  if (editingText.value.trim() !== props.text) {
    emit('confirm', editingText.value.trim());
  }
  emit('update:visible', false);
};

// 处理取消
const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};

// 处理遮罩层点击
const handleOverlayClick = (event: MouseEvent) => {
  // 如果点击的是遮罩层本身，确认编辑
  if (event.target === event.currentTarget) {
    handleConfirm();
  }
};

// 监听外部点击
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.text-edit-container') && 
      !target.closest('.page-item') && 
      props.visible) {
    handleConfirm();
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  if (props.visible) {
    focusTextarea();
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    editingText.value = props.text;
    focusTextarea();
  }
});

// 监听 text 变化
watch(() => props.text, (newVal) => {
  editingText.value = newVal;
});
</script>

<style scoped>
.text-edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.1);
}

.text-edit-container {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e1e5e9;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

textarea {
  border: 2px solid var(--fei-text-color-primary);
  border-radius: 6px;
  padding: 12px;
  background: white;
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.4;
  transition: border-color 0.2s ease;
}

textarea:focus {
  border-color: var(--fei-text-color-primary);
}

.text-edit-toolbar {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.toolbar-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 60px;
}

.toolbar-btn.confirm {
  background: var(--fei-text-color-primary);
  color: white;
  border-color: var(--fei-text-color-primary);
}

.toolbar-btn.confirm:hover {
  background: var(--fei-text-color-primary);
  border-color: var(--fei-text-color-primary);
}

.toolbar-btn.cancel {
  background: #f8f9fa;
  color: #495057;
  border-color: #dee2e6;
}

.toolbar-btn.cancel:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.toolbar-btn:active {
  transform: translateY(1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .text-edit-container {
    max-width: 90vw;
  }
}
</style>