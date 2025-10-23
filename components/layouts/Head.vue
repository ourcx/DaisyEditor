<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { computed } from "vue";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Docs",
    to: "/getting-started",
    active: route.path.startsWith("/getting-started"),
  },
  {
    label: "Components",
    to: "/components",
  },
  {
    label: "Roadmap",
    to: "/roadmap",
    active: route.path.startsWith("/roadmap"),
  },
  {
    label: "Figma",
    to: "https://go.nuxt.com/figma-ui3",
    target: "_blank",
  },
  {
    label: "Releases",
    to: "https://github.com/nuxt/ui/releases",
    target: "_blank",
  },
]);
</script>

<template>
  <UHeader>
    <template #title>
      <!-- 替换 Logo 为文本 -->
      <span class="text-xl font-bold">My App</span>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/nuxt/ui"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>
  </UHeader>
</template>
