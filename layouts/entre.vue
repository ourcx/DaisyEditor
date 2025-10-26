<script setup lang="ts">
interface MenuItem {
  id: number;
  title: string;
  path: string;
  icon?: string;
}

interface UserInfo {
  name: string;
  avatar: string;
  role: string;
}

const menuItems = ref<MenuItem[]>([
  { id: 1, title: "仪表盘", path: "/admin/dashboard", icon: "dashboard" },
  { id: 2, title: "用户管理", path: "/admin/users", icon: "users" },
  { id: 3, title: "系统设置", path: "/admin/settings", icon: "settings" },
]);

const userInfo = ref<UserInfo>({
  name: "管理员",
  avatar: "/avatar.png",
  role: "admin",
});
</script>

<template>
  <div class="admin-layout">
    <nav class="sidebar">
      <template v-for="item in menuItems" :key="item.id">
        <NuxtLink :to="item.path">
          <i v-if="item.icon" :class="item.icon" />
          {{ item.title }}
        </NuxtLink>
      </template>
    </nav>

    <div class="main-content">
      <header>
        <h1>管理后台</h1>
        <div class="user-info">
          <img :src="userInfo.avatar" :alt="userInfo.name" />
          <span>{{ userInfo.name }}</span>
        </div>
      </header>

      <main>
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.sidebar {
  background-color: #f4f4f4;
  padding: 1rem;
}

.main-content {
  padding: 1rem;
}
</style>
