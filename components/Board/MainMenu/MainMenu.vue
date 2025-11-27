<template>
  <div class="menu-items-grid">
    <div 
      v-for="item in menuItems" 
      :key="item.id" 
      class="menu-item" 
      @click="handleItemClick(item)"
      :class="{ disabled: item.requireText && currentPageType !== 'Text' }"
    >
      <i :class="item.icon" class="menu-icon"></i>
      <span class="menu-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentPageType: string;
}

interface Emits {
  (e: 'action', action: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  command?: () => void;
  requireText?: boolean;
}

const menuItems = ref<MenuItem[]>([
  {
    id: 'change-shape',
    icon: 'pi pi-expand',
    label: '更改图形',
    command: () => emit('action', 'change-shape')
  },
  {
    id: 'change-color',
    icon: 'pi pi-palette',
    label: '更改颜色',
    command: () => emit('action', 'change-color')
  },
  {
    id: 'change-border',
    icon: 'pi pi-bullseye',
    label: '更改边框',
    command: () => emit('action', 'change-border')
  },
  {
    id: 'change-text',
    icon: 'pi pi-amazon',
    label: '文本设置',
    command: () => emit('action', 'change-text'),
    requireText: true
  },
  {
    id: 'duplicate',
    icon: 'pi pi-copy',
    label: '复制',
    command: () => emit('action', 'duplicate')
  },
  {
    id: 'delete',
    icon: 'pi pi-trash',
    label: '删除',
    command: () => emit('action', 'delete')
  },
  {
    id: 'bring-to-front',
    icon: 'pi pi-arrow-up',
    label: '置顶',
    command: () => emit('action', 'bring-to-front')
  },
  {
    id: 'send-to-back',
    icon: 'pi pi-arrow-down',
    label: '置底',
    command: () => emit('action', 'send-to-back')
  },
  {
    id: 'image-setting',
    icon: 'pi pi-cog',
    label: '图片设置',
    command: () => emit('action', 'image-setting')
  }
]);

const handleItemClick = (item: MenuItem) => {
  if (item.requireText && props.currentPageType !== 'Text') {
    return; // 父组件会处理提示
  }
  
  if (item.command) {
    item.command();
  }
};
</script>

<style scoped>
.menu-items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.menu-item:hover:not(.disabled) {
  background: #f3f4f6;
  transform: translateY(-1px);
}

.menu-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.menu-icon {
  font-size: 18px;
  margin-bottom: 6px;
  color: #6b7280;
}

.menu-label {
  font-size: 12px;
  color: #374151;
  text-align: center;
  line-height: 1.2;
}
</style>