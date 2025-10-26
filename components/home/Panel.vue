<template>
  <div class="card">
    <Toast />
    <Panel toggleable>
      <template #header>
        <div class="flex items-center gap-2 justify-center">
          <Avatar
            image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
            shape="circle"
          />
          <span class="font-bold">张小明</span>
        </div>
      </template>
      <template #footer>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <Button icon="pi pi-user" rounded text></Button>
            <Button icon="pi pi-bookmark" severity="secondary" rounded text></Button>
          </div>
          <span class="text-surface-500 dark:text-surface-400">2小时前更新</span>
        </div>
      </template>
      <template #icons>
        <Button icon="pi pi-cog" severity="secondary" rounded text @click="toggle" />
        <Menu ref="menu" id="config_menu" :model="items" popup />
      </template>
      <p class="m-0">
        欢迎使用Daisy协作编辑平台！这是一个功能强大的在线协作工具，专为团队协作设计。
        我们的平台支持多人实时协同编辑，让团队成员无论身处何地都能高效合作。您可以创建、
        编辑和分享各种文档，系统会自动保存所有更改，确保您的工作不会丢失。通过版本控制
        功能，您可以轻松查看和恢复历史版本，让协作更加安心便捷。
      </p>
    </Panel>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import Menu from "primevue/menu";

const menu = ref(null);
const toast = useToast();
const router = useRouter();

const items = ref([
  {
    label: "刷新",
    icon: "pi pi-refresh",
  },
  {
    label: "搜索",
    icon: "pi pi-search",
  },
  {
    separator: true,
  },
  {
    label: "删除",
    icon: "pi pi-times",
  },
]);

const toggle = (event) => {
  menu.value.toggle(event);
};

const save = () => {
  toast.add({
    severity: "success",
    summary: "成功",
    detail: "数据保存成功",
    life: 3000,
  });
};
</script>

<style scoped>
.card {
  padding: 5rem;
}
</style>
