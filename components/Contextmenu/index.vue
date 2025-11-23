<template name="contextmenu">
  <div v-show="visible" :style="style" class="context-menu">
    <ul>
      <li v-for="item in menuItems" :key="item.key" @click="handleClick(item)">
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";

interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  handler?: () => void;
}

const props = defineProps<{
  menuItems: MenuItem[];
}>();

const visible = ref(false);
const position = ref({ x: 0, y: 0 });

const style = computed(() => ({
  left: position.value.x + "px",
  top: position.value.y + "px",
}));

const show = (e: MouseEvent) => {
  e.preventDefault();
  position.value = { x: e.clientX, y: e.clientY };
  visible.value = true;

  // 点击其他地方关闭菜单
  document.addEventListener("click", hide);
};

const hide = () => {
  visible.value = false;
  document.removeEventListener("click", hide);
};

const handleClick = (item: MenuItem) => {
  item.handler?.();
  hide();
};

// 暴露方法给父组件
defineExpose({ show, hide });
</script>
<style scoped>
.context-menu {
  position: fixed;
  z-index: 999;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: auto;
}

ul {
  list-style: none;
  padding: 5px 0;
  margin: 0;
}

li {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

li:hover {
  background-color: #f5f5f5;
}
</style>
