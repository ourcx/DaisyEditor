<template>
  <header class="header" :class="{ 'header-bg': bg }">
    <div class="header-container">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo">
          <i class="pi pi-star-fill"></i>
          <span class="logo-text">Daisy 文档协作</span>
        </div>
      </div>

      <!-- 主导航菜单 -->
      <nav class="nav-section">
        <ul class="nav-menu">
          <li class="nav-item">
            <router-link to="/" class="nav-link active">首页</router-link>
          </li>
          <li class="nav-item">
            <!-- 页面跳转 -->
            <router-link to="/product" class="nav-link">产品</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/" class="nav-link">解决方案</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link">关于我们</router-link>
          </li>
        </ul>
      </nav>

      <!-- 搜索和用户操作区域 -->
      <div class="action-section">
        <!-- 搜索框 -->
        <div class="search-container">
          <InputGroup class="search-group">
            <InputText v-model="searchQuery" placeholder="搜索..." />
            <InputGroupAddon>
              <i class="pi pi-search"></i>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <!-- 用户操作 -->
        <div class="user-actions">
          <Button
            icon="pi pi-bell"
            class="p-button-rounded p-button-text action-btn"
            severity="secondary"
          />
          <Button
            icon="pi pi-user"
            class="p-button-rounded p-button-text action-btn"
            severity="secondary"
          />
          <Button
            label="登录"
            class="login-btn"
            severity="primary"
            @click="toggle('login')"
          />
        </div>

        <!-- 移动端菜单按钮 -->
        <Button
          icon="pi pi-bars"
          class="p-button-rounded p-button-text mobile-menu-btn"
          @click="toggleMobileMenu"
          severity="secondary"
        />
        <!-- github -->
        <a href="https://github.com/ourcx/DaisyEditor" target="_blank">
          <Button
            icon="pi pi-github"
            class="p-button-rounded p-button-text action-btn"
            severity="secondary"
          />
        </a>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ 'mobile-menu-open': mobileMenuOpen }">
      <ul class="mobile-nav-menu">
        <li class="mobile-nav-item">
          <a href="#" class="mobile-nav-link active">首页</a>
        </li>
        <li class="mobile-nav-item">
          <a href="#" class="mobile-nav-link">产品</a>
        </li>
        <li class="mobile-nav-item">
          <a href="#" class="mobile-nav-link">解决方案</a>
        </li>
        <li class="mobile-nav-item">
          <a href="#" class="mobile-nav-link">定价</a>
        </li>
        <li class="mobile-nav-item">
          <a href="#" class="mobile-nav-link">关于我们</a>
        </li>
        <li class="mobile-nav-item">
          <Button label="登录" class="mobile-login-btn" severity="primary" />
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup>
// 导入PrimeVue组件
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const bg = ref(false);
// 响应式数据
const searchQuery = ref("");
const mobileMenuOpen = ref(false);

// 切换移动端菜单显示/隐藏
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

//监听页面滚动
onMounted(() => {
  window.addEventListener("scroll", () => {
    bg.value = window.scrollY > 0;
  });
});

const toggleMap = {
  login: "/entre",
};

const toggle = (index) => {
  //跳转页面
  const path = toggleMap[index];
  return navigateTo(path);
};
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  height: 10vh;
  transition: all 0.3s ease-in-out;
  background: transparent;
}

.header-bg {
  background-color: var(--fei-bg-color);
  height: 8vh;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  background: transparent;
}

/* Logo区域样式 */
.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--fei-text-color-primary);
  font-weight: 600;
  font-size: 1.25rem;
}

.logo i {
  color: var(--fei-color-primary);
  font-size: 1.5rem;
}

.logo-text {
  color: var(--fei-text-color-primary);
  background: none;
  -webkit-text-fill-color: var(--fei-text-color-primary);
}

/* 导航菜单样式 */
.nav-section {
  display: flex;
  align-items: center;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-item {
  display: flex;
}

.nav-link {
  color: var(--fei-text-color-regular);
  text-decoration: none;
  padding: 0.5rem 0;
  border-radius: 0;
  transition: all 0.2s ease;
  font-weight: 500;
  position: relative;
}

.nav-link:hover {
  color: var(--fei-color-primary);
}

.nav-link.active {
  color: var(--fei-color-primary);
  font-weight: 600;
}

.nav-link.active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--fei-color-primary);
  border-radius: 1px;
}

/* 操作区域样式 */
.action-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container {
  width: 280px;
}

.search-group {
  width: 100%;
}

:deep(.p-inputtext) {
  border-radius: 6px;
  background: var(--fei-bg-color);
  color: var(--fei-text-color-primary);
}

:deep(.p-inputtext:focus) {
  border-color: var(--fei-color-primary);
}

:deep(.p-inputgroup-addon) {
  background: var(--fei-fill-color-light);
  border-left: none;
  color: var(--fei-text-color-secondary);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

:deep(.action-btn.p-button) {
  color: var(--fei-text-color-secondary) !important;
  background: transparent !important;
  border: none !important;
}

:deep(.action-btn.p-button:hover) {
  color: var(--fei-color-primary) !important;
  background: var(--fei-fill-color-light) !important;
}

:deep(.login-btn.p-button) {
  background: var(--fei-color-primary) !important;
  border-color: var(--fei-color-primary) !important;
  color: white !important;
  font-weight: 500;
}

:deep(.login-btn.p-button:hover) {
  background: var(--fei-color-primary-dark-2) !important;
  border-color: var(--fei-color-primary-dark-2) !important;
}

.mobile-menu-btn {
  display: none;
  color: var(--fei-text-color-secondary);
}

/* 移动端菜单样式 */
.mobile-menu {
  display: none;
  background-color: var(--fei-bg-color);
  padding: 1rem 2rem;
  border-top: 1px solid var(--fei-border-color-light);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.mobile-menu-open {
  display: block;
}

.mobile-nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-item {
  width: 100%;
}

.mobile-nav-link {
  display: block;
  color: var(--fei-text-color-regular);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--fei-color-primary);
  background-color: color-mix(in srgb, var(--fei-color-primary) 8%, transparent);
}

:deep(.mobile-login-btn.p-button) {
  width: 100%;
  margin-top: 1rem;
  background: var(--fei-color-primary) !important;
  border-color: var(--fei-color-primary) !important;
  color: white !important;
  font-weight: 500;
}

:deep(.mobile-login-btn.p-button:hover) {
  background: var(--fei-color-primary-dark-2) !important;
  border-color: var(--fei-color-primary-dark-2) !important;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nav-section {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0.75rem 1.5rem;
  }

  .search-container {
    width: 240px;
  }
}

@media (max-width: 640px) {
  .search-container {
    display: none;
  }

  .user-actions {
    display: none;
  }

  .logo-text {
    font-size: 1.125rem;
  }

  .header-container {
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 1rem;
  }

  .logo i {
    font-size: 1.25rem;
  }
}
</style>
