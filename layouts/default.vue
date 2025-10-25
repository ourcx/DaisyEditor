<template>
  <div class="container mx-auto">
    <Head />
    <slot></slot>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Head from "../components/layouts/Head.vue";
import Footer from "~/components/layouts/Footer.vue";
</script>


<style lang="scss">
.container {
  max-width: 100vw;
  background-color: var(--fei-bg);
}
</style>
