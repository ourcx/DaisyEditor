<template>
    <div class="container h-full">
        <div ref="canvasRef" class="w-full h-full" :style="{ transformOrigin: '0 0' }">
            <div v-for="(page, index) in pages" :key="index"
                class="absolute bg-white rounded-lg shadow-lg p-4 border border-gray-200 cursor-pointer select-none"
                :style="{ top: page.rect.y + 'px', left: page.rect.x + 'px', width: page.rect.width + 'px', height: page.rect.height + 'px' }">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ page.type }}</h3>
                <p class="text-gray-600">Some content here...</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    // 禁用布局
    layout: false,
});

import type { WhithBoardProps } from './type';
import { ref } from 'vue';
import { throttle } from 'lodash-es';

const canvasRef = ref<HTMLElement | null>(null);
//画布上元素的数据
const pages = ref<WhithBoardProps[]>([
    {
        rect: {
            x: 810,
            y: 10,
            width: 300,
            height: 200
        },
        type: 'rect',
        background: 'red',
        borderWidth: 1,
        borderColor: 'black'
    },
    {
        rect: {
            x: 520,
            y: 120,
            width: 300,
            height: 200
        },
        type: 'rect',
        background: 'red',
        borderWidth: 1,
        borderColor: 'black'
    },
    {
        rect: {
            x: 210,
            y: 610,
            width: 300,
            height: 200
        },
        type: 'rect',
        background: 'red',
        borderWidth: 1,
        borderColor: 'black'
    }
]);

//画布的鼠标拖动
// 用于记录 canvas 的偏移量信息
const transformRef = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const dragCanvas = (e: MouseEvent) => {
    if (!canvasRef.value) return
    const canvasElement = canvasRef.value
    // 拖拽
    let isDragging = false
    let startX = 0
    let startY = 0
    let startTranslateX = 0
    let startTranslateY = 0

     if (e.button !== 0) {
      return
    }
    isDragging = true
    // 记录鼠标按下时的初始位置
    startX = e.clientX
    startY = e.clientY
    // 记录元素当前的偏移量
    startTranslateX = transformRef.value.x
    startTranslateY = transformRef.value.y

    // throttle
    const mouseMove = throttle((e: MouseEvent) => {
      if (isDragging) {
        const offsetX = e.clientX - startX
        const offsetY = e.clientY - startY
        transformRef.value.x = startTranslateX + offsetX
        transformRef.value.y = startTranslateY + offsetY
        canvasElement.style.transform = `translate(${transformRef.value.x}px, ${transformRef.value.y}px))`
      }
    }, 16)

    const mouseUp = () => {
      isDragging = false
      document.removeEventListener('mouseup', mouseUp)
      document.removeEventListener('mousemove', mouseMove)
    }

    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('mouseup', mouseUp)
}
</script>

<style scoped>
.container {
    height: 100vh;
    position: relative;
}
</style>