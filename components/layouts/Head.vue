<template>
  <UHeader>
    <template #title>
      <div class="h-6 w-auto" />
    </template>
    <template #right>
      <UColorModeButton />
      <UButton
        color="neutral"
        variant="ghost"
        to="https://github.com/nuxt/ui"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
      />
    </template>
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const items = [
  {
    title: "Home",
    href: "/",
  },
];
</script>
