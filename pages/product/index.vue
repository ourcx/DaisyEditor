<template>
  <div class="container">
    <div class="index-container">
      <div class="index-content flex flex-col items-center justify-center px-4">
        <div
          class="index-content-title text-5xl md:text-6xl font-bold text-gray-800 mb-4 tracking-tight"
        >
          Daisy Editor
        </div>
        <div class="index-content-desc text-xl md:text-2xl text-gray-600 mb-8 font-light">
          文档协作编辑
        </div>
        <Button label="开始使用 >" @click="ToDocs">
        </Button>
      </div>
    </div>
    <div class="index-two">
      <div class="index-two-content flex flex-col items-center justify-center px-4">
        <div
          class="index-content-title text-5xl md:text-6xl font-bold text-gray-800 mb-4 tracking-tight"
        >
          Daisy Editor
        </div>
        <div class="index-content-desc text-xl md:text-2xl text-gray-600 mb-8 font-light">
          Daisy Editor
        </div>
        <div class="mook-container">
          <Image src="https://picsum.photos/350/350" alt="Image" class="mook-image" />
          <!-- 渐变遮罩层 -->
          <div class="gradient-overlay"></div>
        </div>
        <router-link to="/product" class="text-blue-800">创建文档》</router-link>
      </div>
    </div>
    <div class="index-three bg-gray-100">
      <div class="index-three-content flex flex-col items-center justify-center px-4">
        <Galleria
          v-model:activeIndex="activeIndex"
          :value="images"
          :responsiveOptions="responsiveOptions"
          :numVisible="5"
          containerStyle="max-width: 640px"
        >
          <template #item="slotProps">
            <img
              :src="slotProps.item.itemImageSrc"
              :alt="slotProps.item.alt"
              style="width: 100%"
            />
          </template>
          <template #thumbnail="slotProps">
            <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" />
          </template>
        </Galleria>
      </div>
    </div>
    <div class="index-two">
      <div class="index-two-content flex flex-col items-center justify-center px-4">
        <div
          class="index-content-title text-5xl md:text-6xl font-bold text-gray-800 mb-4 tracking-tight"
        >
          Daisy Editor
        </div>
        <div class="index-content-desc text-xl md:text-2xl text-gray-600 mb-8 font-light">
          Daisy Editor
        </div>
        <div class="mook-container">
          <Image src="https://picsum.photos/350/350" alt="Image" class="mook-image" />
          <!-- 渐变遮罩层 -->
          <div class="gradient-overlay"></div>
        </div>
        <router-link to="/product" class="text-blue-800">创建文档》</router-link>
      </div>
    </div>
    <div class="index-three bg-gray-100">
      <div class="index-three-content flex flex-col items-center justify-center px-4">
        <Galleria
          v-model:activeIndex="activeIndex"
          :value="images"
          :responsiveOptions="responsiveOptions"
          :numVisible="5"
          containerStyle="max-width: 640px"
        >
          <template #item="slotProps">
            <img
              :src="slotProps.item.itemImageSrc"
              :alt="slotProps.item.alt"
              style="width: 100%"
            />
          </template>
          <template #thumbnail="slotProps">
            <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" />
          </template>
        </Galleria>
      </div>
    </div>
    <div class="index-two">
      <div class="index-two-content flex flex-col items-center justify-center px-4">
        <div
          class="index-content-title text-5xl md:text-6xl font-bold text-gray-800 mb-4 tracking-tight"
        >
          Daisy Editor
        </div>
        <div class="index-content-desc text-xl md:text-2xl text-gray-600 mb-8 font-light">
          Daisy Editor
        </div>
        <div class="mook-container">
          <Image src="https://picsum.photos/350/350" alt="Image" class="mook-image" />
          <!-- 渐变遮罩层 -->
          <div class="gradient-overlay"></div>
        </div>
        <router-link to="/product" class="text-blue-800">创建文档》</router-link>
      </div>
    </div>
    <div class="index-three bg-gray-100">
      <div class="index-three-content flex flex-col items-center justify-center px-4">
        <Galleria
          v-model:activeIndex="activeIndex"
          :value="images"
          :responsiveOptions="responsiveOptions"
          :numVisible="5"
          containerStyle="max-width: 640px"
        >
          <template #item="slotProps">
            <img
              :src="slotProps.item.itemImageSrc"
              :alt="slotProps.item.alt"
              style="width: 100%"
            />
          </template>
          <template #thumbnail="slotProps">
            <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" />
          </template>
        </Galleria>
      </div>
    </div>
    <div class="index-two">
      <div class="index-two-content flex flex-col items-center justify-center px-4">
        <div
          class="index-content-title text-5xl md:text-6xl font-bold text-gray-800 mb-4 tracking-tight"
        >
          Daisy Editor
        </div>
        <div class="index-content-desc text-xl md:text-2xl text-gray-600 mb-8 font-light">
          Daisy Editor
        </div>
        <div class="mook-container">
          <Image src="https://picsum.photos/350/350" alt="Image" class="mook-image" />
          <!-- 渐变遮罩层 -->
          <div class="gradient-overlay"></div>
        </div>
        <router-link to="/product" class="text-blue-800">创建文档》</router-link>
      </div>
    </div>
    <div class="index-three bg-gray-100">
      <div class="index-three-content flex flex-col items-center justify-center px-4">
        <Galleria
          v-model:activeIndex="activeIndex"
          :value="images"
          :responsiveOptions="responsiveOptions"
          :numVisible="5"
          containerStyle="max-width: 640px"
        >
          <template #item="slotProps">
            <img
              :src="slotProps.item.itemImageSrc"
              :alt="slotProps.item.alt"
              style="width: 100%"
            />
          </template>
          <template #thumbnail="slotProps">
            <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" />
          </template>
        </Galleria>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Image from "primevue/image";
import Galleria from "primevue/galleria";
import { ref, onMounted } from "vue";
import { navigateTo } from "#app";
definePageMeta({
  layout: "product" as any,
});

const images = ref([
  { itemImageSrc: "https://picsum.photos/id/1018/800/450.jpg" },
  {
    itemImageSrc: "https://picsum.photos/id/1015/800/450.jpg",
  },
  {
    itemImageSrc: "https://picsum.photos/id/1019/800/450.jpg",
  },
]);
const activeIndex = ref(2);
const responsiveOptions = ref([
  {
    breakpoint: "1300px",
    numVisible: 4,
  },
  {
    breakpoint: "575px",
    numVisible: 1,
  },
]);

const ToDocs = () => {
  navigateTo("/entre");
}
const next = () => {
  activeIndex.value =
    activeIndex.value === images.value.length - 1
      ? images.value.length - 1
      : activeIndex.value + 1;
};
const prev = () => {
  activeIndex.value = activeIndex.value === 0 ? 0 : activeIndex.value - 1;
};
</script>

<style scoped>
.container {
  max-width: 100vw;
}

.index-container {
  width: 100%;
  height: 100vh;
  background-image: url("https://as.smgv.cn/static/lizard-service-homepage/assets/personal_banner.462f9ef4.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.index-two {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: transparent;
}

.mook-container {
  position: relative;
  width: 350px;
  height: 350px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0px -15px 15px rgba(0, 0, 0, 0.6);
}

.mook-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease-in-out;
}

.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.8) 30%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
}
.index-three {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
