<script setup lang="ts">
interface MenuItem {
  id: number;
  title: string;
  path: string;
  icon?: string;
}

interface UserInfo {
  name: string;
  role: string;
}

const menuItems = ref<MenuItem[]>([
  { id: 1, title: "仪表盘", path: "/admin/dashboard", icon: "pi pi-home" },
  { id: 2, title: "用户管理", path: "/admin/users", icon: "pi pi-users" },
  { id: 3, title: "系统设置", path: "/admin/settings", icon: "pi pi-cog" },
]);
const value = ref('');
const userInfo = ref<UserInfo>({
  name: "组织",
  role: "admin",
});

const asideWidth = ref(200)
const minAsideWidth = ref(180)
const maxAsideWidth = ref(500)

// 拖拽状态
const isDragging = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return;

  const deltaX = e.clientX - startX.value;
  let newWidth = startWidth.value + deltaX;

  // 限制宽度范围
  newWidth = Math.max(minAsideWidth.value, Math.min(maxAsideWidth.value, newWidth));

  asideWidth.value = newWidth;

  // 防止文本选择
  e.preventDefault();
}

const stopDrag = () => {
  if (!isDragging.value) return;

  isDragging.value = false;
  document.body.classList.remove("dragging");
  document.body.style.userSelect = "";
  document.body.style.cursor = "";

  removeDragEvents();
}

const startDrag = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  isDragging.value = true;
  startX.value = e.clientX;
  startWidth.value = asideWidth.value;

  // 添加拖拽样式
  document.body.classList.add("dragging");
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";

  // 添加事件监听
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}

const removeDragEvents = () => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  localStorage.setItem("asideWidth", asideWidth.value.toString());
}

const handleResize = () => {
  const windowWidth = window.innerWidth;

  // 在小屏幕上自动调整侧边栏宽度
  if (windowWidth < 768) {
    asideWidth.value = Math.min(asideWidth.value, 300);
  }

  // 确保侧边栏不会超出屏幕
  if (asideWidth.value > windowWidth * 0.6) {
    asideWidth.value = Math.floor(windowWidth * 0.6);
  }
}

onMounted(() => {
  window.addEventListener("resize", handleResize);
  //拿到储存在本地的宽度
  asideWidth.value = Number(localStorage.getItem("asideWidth")) || asideWidth.value;
})

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  removeDragEvents();
})
</script>

<template>
  <div class="admin-layout">
    <nav class="sidebar" :style="{ width: asideWidth + 'px' }">
      <div class="sidebar-top">
        <img src="https://s2.loli.net/2025/11/15/fQ5bv8o2cxuC9da.jpg" alt="Logo" class="sidebar-logo" />
        <div class="sidebar-title">
          <i class="pi pi-plus-circle"></i>
        </div>
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <span class="p-input-icon-left">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText type="text" v-model="value" placeholder="搜索..." class="search-input" />
          </IconField>
        </span>
      </div>

      <!-- 菜单区域 -->
      <div class="sidebar-menu">
        <template v-for="item in menuItems" :key="item.id">
          <NuxtLink :to="item.path" class="menu-item" active-class="menu-item-active">
            <i :class="item.icon" class="menu-icon" />
            <span class="menu-text">{{ item.title }}</span>
          </NuxtLink>
        </template>
      </div>
      <div class="sidebar-menu">
        <!-- 这个是一个底部的组织切换 -->
        <div class="menu-item">
        </div>
      </div>
      <div class="sidebar-bottom">
        <div class="user-card">
          <div class="user-details">
            <span class="user-name">{{ userInfo.name }}</span>
            <span class="user-role">{{ userInfo.role }}</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- 拖拽手柄 -->
    <div class="resize" title="拖拽调整宽度" @mousedown="startDrag" :class="{ 'resize-dragging': isDragging }">
      <div class="resize-handle">
        <span>⋮</span>
      </div>
    </div>

    <div class="main-content">
      <main class="main-body">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  flex-direction: row;
  align-items: stretch;
  position: relative;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #465069;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.1s ease;
}

/* 顶部区域 */
.sidebar-top {
  padding: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.sidebar-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  opacity: 0.9;
}

/* 搜索区域 */
.search-section {
  padding: 1.5rem 1.5rem 1rem;
}

.search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgb(0, 0, 0);
  border-radius: 8px;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.1);
}

.search-icon {
  color: rgba(255, 255, 255, 0.6);
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

/* 菜单区域 */
.sidebar-menu {
  flex: 1;
  padding: 1rem 0.5rem;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  margin: 0.25rem 0.75rem;
  transition: all 0.3s ease;
  position: relative;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(5px);
}

.menu-item-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.menu-icon {
  margin-right: 0.75rem;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.menu-text {
  font-weight: 500;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 底部用户信息 */
.sidebar-bottom {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-card {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.user-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-top: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 主内容区域 */
.main-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  flex: 1;
  min-width: 0;
  background-color: #f8f9fa;
}

.main-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background-color: #f8f9fa;
}

/* 拖拽手柄样式 */
.resize {
  user-select: none;
  position: relative;
  width: 12px;
  background: #f0f0f0;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 20;
  transition: background-color 0.2s ease;
}

.resize:hover {
  background: #e0e0e0;
}

.resize-dragging,
.resize:active {
  background: #d0d0d0;
}

.resize-handle {
  width: 4px;
  height: 40px;
  background: #c0c0c0;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s ease;
  position: relative;
}

.resize:hover .resize-handle {
  background: #a0a0a0;
  transform: scale(1.1);
}

.resize-dragging .resize-handle {
  background: #909090;
  transform: scale(1.2);
}

/* 拖拽时的全局样式 */
body.dragging {
  cursor: col-resize !important;
  user-select: none !important;
}

body.dragging * {
  cursor: col-resize !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    left: -100%;
    top: 0;
    bottom: 0;
    width: 280px;
    transition: left 0.3s ease;
    z-index: 1000;
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .resize {
    display: none;
  }
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 隐藏默认滚动条 */
::-webkit-scrollbar {
  display: none;
}
</style>