<template>
    <div class="canvas-container" ref="containerRef" @wheel="handleCanvasWheel" @mousedown="dragCanvas">
        <div class="grid-bg" :style="gridStyle"></div>
        <div ref="canvasRef" class="canvas" :style="canvasStyle">
            <div v-for="(page, index) in pages" :key="index"
                class="absolute bg-white rounded-lg shadow-lg p-4 border border-gray-200 cursor-pointer select-none"
                :style="{
                    top: page.rect.y + 'px',
                    left: page.rect.x + 'px',
                    width: page.rect.width + 'px',
                    height: page.rect.height + 'px',
                    background: page.background,
                    border: `${page.borderWidth}px solid ${page.borderColor}`
                }">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ page.type }}</h3>
                <p class="text-gray-600">x: {{ page.rect.x }}, y: {{ page.rect.y }}</p>
            </div>
        </div>

        <div class="fixed bottom-4 right-4 bg-black/70 text-white p-2 rounded text-xs">
            Scale: {{ transformRef.scale.toFixed(2) }} | X: {{ transformRef.x.toFixed(0) }} | Y: {{
                transformRef.y.toFixed(0) }}
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
});

import { ref, computed, onMounted, onUnmounted, type CSSProperties } from 'vue';
import { throttle } from 'lodash-es';

// 定义简单类型以避免导入错误
interface Rect { x: number; y: number; width: number; height: number; }
interface WhithBoardProps { rect: Rect; type: string; background: string; borderWidth: number; borderColor: string; }

const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);

// 示例数据
const pages = ref<WhithBoardProps[]>([
    { rect: { x: 0, y: 0, width: 200, height: 150 }, type: '原点', background: '#e3f2fd', borderWidth: 1, borderColor: '#2196f3' },
    { rect: { x: 500, y: 200, width: 200, height: 150 }, type: 'Rect 2', background: '#fff3e0', borderWidth: 1, borderColor: '#ff9800' },
    { rect: { x: -300, y: 400, width: 200, height: 150 }, type: '负坐标测试', background: '#e8f5e9', borderWidth: 1, borderColor: '#4caf50' }
]);

// 核心状态：画布的偏移量和缩放
const transformRef = ref({ x: 0, y: 0, scale: 1 });

// --- 核心改动 1: 内容层样式 ---
// 移除 width/height 的动态计算，只需负责 Transform
const canvasStyle = computed<CSSProperties>(() => ({
    transform: `translate(${transformRef.value.x}px, ${transformRef.value.y}px) scale(${transformRef.value.scale})`,
    transformOrigin: '0 0', // 以左上角为原点
    width: '0px',  // 关键：不需要实际尺寸
    height: '0px', // 关键：不需要实际尺寸
    position: 'absolute',
    top: '0',
    left: '0',
    overflow: 'visible'
}));

// --- 核心改动 2: 网格背景样式 ---
// 背景不动，通过 background-position 跟着 transform 变，制造移动错觉
const gridStyle = computed<CSSProperties>(() => {
    const { x, y, scale } = transformRef.value;
    const gridSize = 20 * scale; // 网格大小随缩放变化

    return {
        position: 'absolute',
        inset: 0, // 铺满父容器
        zIndex: 0,
        // 关键点：背景位置 = 偏移量
        backgroundPosition: `${x}px ${y}px`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundImage: `
            linear-gradient(to right, #ddd 1px, transparent 1px),
            linear-gradient(to bottom, #ddd 1px, transparent 1px)
        `,
        pointerEvents: 'none' // 确保鼠标事件穿透到下层的 canvas
    };
});

// --- 拖拽逻辑 ---
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const startTranslateX = ref(0);
const startTranslateY = ref(0);

const dragCanvas = (e: MouseEvent) => {
    // 只有按住空格 或者 鼠标中键 或者 特定模式才允许拖拽，防止与选中文本冲突
    // 这里为了演示保留左键直接拖拽，但建议配合 Space 键判断
    if (e.button !== 0) return;
    //增加空格判断
    startX.value = e.clientX;
    startY.value = e.clientY;
    startTranslateX.value = transformRef.value.x;
    startTranslateY.value = transformRef.value.y;

    const mouseMove = throttle((e: MouseEvent) => {
        if (!isDragging.value) return;
        if (containerRef.value) containerRef.value.style.cursor = 'grabbing';
        const offsetX = e.clientX - startX.value;
        const offsetY = e.clientY - startY.value;

        // --- 核心改动 3: 移除 resize 逻辑 ---
        // 只更新 transform x/y，无需修改 canvasSize
        transformRef.value = {
            ...transformRef.value,
            x: startTranslateX.value + offsetX,
            y: startTranslateY.value + offsetY
        };
    }, 16);

    const mouseUp = () => {
        if (containerRef.value) containerRef.value.style.cursor = 'grab';
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
    };

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
};

// --- 滚轮缩放逻辑 (优化版) ---
const handleCanvasWheel = throttle((event: WheelEvent) => {
    event.preventDefault();
    const { deltaY, clientX, clientY, ctrlKey, metaKey } = event;

    // 缩放 (Ctrl + 滚轮 或 触控板捏合)
    if (ctrlKey || metaKey) {
        if (!containerRef.value) return;

        const rect = containerRef.value.getBoundingClientRect();
        // 鼠标相对于容器左上角的坐标
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const zoomIntensity = 0.1;
        const wheel = deltaY < 0 ? 1 : -1;
        const newScale = Math.max(0.1, Math.min(5, transformRef.value.scale * (1 + wheel * zoomIntensity)));

        // 核心数学公式：确保以鼠标为中心缩放
        // (mouseX - oldTx) / oldScale = worldX = (mouseX - newTx) / newScale
        // 推导得: newTx = mouseX - (mouseX - oldTx) * (newScale / oldScale)

        const scaleRatio = newScale / transformRef.value.scale;
        const newX = mouseX - (mouseX - transformRef.value.x) * scaleRatio;
        const newY = mouseY - (mouseY - transformRef.value.y) * scaleRatio;

        transformRef.value = { x: newX, y: newY, scale: newScale };
    } else {
        // 移动 (普通滚轮)
        // 许多设计软件 (Figma/Miro) 滚轮默认是垂直移动，Shift+滚轮是水平移动
        // 也有的是滚轮缩放，按住空格移动。这里保留你的位移逻辑。
        transformRef.value.x -= event.deltaX; // 支持触摸板的双指水平滑动
        transformRef.value.y -= event.deltaY;
    }
}, 16);

// 键盘快捷键 (复位功能)
const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space' && !event.repeat) {
        if (containerRef.value) containerRef.value.style.cursor = 'grab';
        isDragging.value = true;
    }
    if (event.code === 'KeyR' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        transformRef.value = { x: 0, y: 0, scale: 1 };
    }
};
const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space' && containerRef.value) {
        containerRef.value.style.cursor = 'default';
        isDragging.value = false;
    }

}

onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
});
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
});
</script>

<style scoped>
.canvas-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    background: #f8f9fa;
    /* 禁止容器本身的滚动，完全接管滚轮事件 */
    touch-action: none;
}

.grid-bg {
    pointer-events: none;
    /* 网格不阻挡鼠标 */
}

.canvas {
    /* z-index 确保内容在网格之上 */
    z-index: 1;
}
</style>