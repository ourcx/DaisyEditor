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
                    border: `${page.borderWidth}px solid ${page.borderColor}`,
                }">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ page.type }}</h3>
                <p class="text-gray-600">x: {{ page.rect.x }}, y: {{ page.rect.y }}</p>
            </div>
        </div>
        <canvas id="canvas" class="canvas"></canvas>

        <div
            class="fixed bottom-4 right-4 bg-black/70 text-white p-2 rounded text-xs flex items-center justify-center gap-2">
            Scale: {{ transformRef.scale.toFixed(2) }} | X: {{ transformRef.x.toFixed(0) }} | Y:
            {{ transformRef.y.toFixed(0) }}
            <!-- 是否开启辅助线 -->
            <Button @click="toggleGuides" class="">辅助线开关</Button>
        </div>

        <!-- 修复小地图区域 -->
        <div v-if="isMinimapVisible"
            class="fixed top-4 right-4 bg-white border border-gray-300 p-3 rounded-lg shadow-lg minimap w-64 h-96">
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">导航地图</span>
                <div class="flex space-x-1">
                    <button @click="zoomInMinimap" class="p-1 rounded hover:bg-gray-200 text-gray-600" title="放大">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4">
                            </path>
                        </svg>
                    </button>
                    <button @click="zoomOutMinimap" class="p-1 rounded hover:bg-gray-200 text-gray-600" title="缩小">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                        </svg>
                    </button>
                    <button @click="refreshMinimap" class="p-1 rounded hover:bg-gray-200 text-gray-600" title="刷新">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                            </path>
                        </svg>
                    </button>
                    <button @click="toggleMinimap" class="p-1 rounded hover:bg-gray-200 text-gray-600" title="隐藏">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="slider w-full relative border border-gray-200 rounded overflow-hidden bg-white">
                <iframe class="slider__content w-full h-full border-none" ref="targetIframe" sandbox="allow-same-origin"
                    @load="onIframeLoad" />

                <!-- 视口指示器 -->
                <div class="absolute border-2 border-red-500 bg-red-200 bg-opacity-20 pointer-events-none transition-all duration-200"
                    :style="viewportIndicatorStyle"></div>
            </div>
        </div>

        <!-- 显示小地图的按钮（当隐藏时） -->
        <button v-else @click="toggleMinimap"
            class="fixed top-4 right-4 p-2 bg-primary-500 text-white rounded-lg shadow-lg hover:bg-red-400 transition-colors"
            title="显示导航地图">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7">
                </path>
            </svg>
        </button>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
});

import { ref, computed, onMounted, onUnmounted, type CSSProperties } from 'vue';
import { throttle } from 'lodash-es';
import { Drawer, Rect as Rectutils } from '~/utils/canvasExtend/drawer-ui';

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
const guide = `
            linear-gradient(to right, #ddd 1px, transparent 1px),
            linear-gradient(to bottom, #ddd 1px, transparent 1px)
        `;

const isGuide = ref(true);
// 小地图缩放
const minimapZoom = ref(0.1);

// 计算视口指示器样式
const viewportIndicatorStyle = computed(() => {
    if (!containerRef.value) return {};

    const containerRect = containerRef.value.getBoundingClientRect();
    const viewportWidth = containerRect.width / transformRef.value.scale;
    const viewportHeight = containerRect.height / transformRef.value.scale;

    // 计算视口在原始画布中的位置
    const viewportX = -transformRef.value.x / transformRef.value.scale;
    const viewportY = -transformRef.value.y / transformRef.value.scale;

    // 转换为小地图坐标
    const indicatorX = viewportX * minimapZoom.value;
    const indicatorY = viewportY * minimapZoom.value;
    const indicatorWidth = viewportWidth * minimapZoom.value;
    const indicatorHeight = viewportHeight * minimapZoom.value;

    return {
        left: `${indicatorX}px`,
        top: `${indicatorY}px`,
        width: `${indicatorWidth}px`,
        height: `${indicatorHeight}px`,
    };
});

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
    const guideText = isGuide.value ? guide : 'none'
    return {
        position: 'absolute',
        inset: 0, // 铺满父容器
        zIndex: 0,
        // 关键点：背景位置 = 偏移量
        backgroundPosition: `${x}px ${y}px`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundImage: guideText,
        pointerEvents: 'none' // 确保鼠标事件穿透到下层的 canvas
    };
});


// --- 拖拽逻辑 ---
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const startTranslateX = ref(0);
const startTranslateY = ref(0);


const toggleGuides = () => {
    //是否显示参考线
    isGuide.value = !isGuide.value;
    console.log('isGuide', isGuide.value, gridStyle.value);
}
const dragCanvas = (e: MouseEvent) => {
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


const targetIframe = ref<HTMLIFrameElement | null>(null);
const isMinimapVisible = ref(true);

// 小地图缩放控制
const zoomInMinimap = () => {
    if (minimapZoom.value < 0.5) {
        minimapZoom.value += 0.05;
        refreshMinimap();
    }
}

const zoomOutMinimap = () => {
    if (minimapZoom.value > 0.05) {
        minimapZoom.value -= 0.05;
        refreshMinimap();
    }
}

// 刷新小地图
const refreshMinimap = () => {
    extractMinimap();
}

// 切换小地图显示
const toggleMinimap = () => {
    isMinimapVisible.value = !isMinimapVisible.value;
}

// 点击小地图导航到对应位置
const navigateToMinimapPosition = (minimapX: number, minimapY: number) => {
    if (!containerRef.value) return;

    const containerRect = containerRef.value.getBoundingClientRect();

    // 将小地图坐标转换为世界坐标
    const worldX = minimapX / minimapZoom.value;
    const worldY = minimapY / minimapZoom.value;

    // 计算需要将世界坐标点移动到视口中心所需的变换
    const targetX = -worldX * transformRef.value.scale + containerRect.width / 2;
    const targetY = -worldY * transformRef.value.scale + containerRect.height / 2;

    // 应用变换
    transformRef.value = {
        ...transformRef.value,
        x: targetX,
        y: targetY
    };
}

// iframe 加载完成后的处理
const onIframeLoad = () => {
    if (!targetIframe.value || !targetIframe.value.contentDocument) return;

    // 添加点击事件监听器到 iframe
    const iframeDoc = targetIframe.value.contentDocument;
    iframeDoc.addEventListener('click', (e) => {
        e.preventDefault();

        // 获取点击位置相对于 iframe 文档的坐标
        const rect = iframeDoc.documentElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 导航到对应位置
        navigateToMinimapPosition(x, y);
    });

    // 添加鼠标悬停效果
    iframeDoc.addEventListener('mousemove', (e) => {
        const rect = iframeDoc.documentElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 可以在这里添加悬停效果，比如改变光标样式
        iframeDoc.body.style.cursor = 'pointer';
    });
}

// 提取网页的minimap
const extractMinimap = () => {
    if (!targetIframe.value) return;

    // 获取当前页面的HTML，但要排除小地图自身
    const originalHtml = document.documentElement.outerHTML;

    // 创建优化后的HTML，添加小地图专用样式
    const optimizedHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* 小地图专用样式 */
        body { 
            transform: scale(${minimapZoom.value}); 
            transform-origin: 0 0;
            width: ${100 / minimapZoom.value}%;
            height: ${100 / minimapZoom.value}%;
            margin: 0;
            padding: 0;
            background: #f8f9fa;
            cursor: pointer;
        }
        /* 隐藏小地图自身 */
        .minimap { 
            display: none !important; 
        }
        /* 隐藏状态显示 */
        .fixed.bottom-4.right-4 {
            display: none !important;
        }
        /* 确保内容可见 */
        .canvas-container {
            overflow: visible !important;
        }
        .canvas {
            transform: none !important;
        }
        /* 增强元素可见性 */
        .absolute {
            border: 1px solid rgba(0,0,0,0.2) !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
        /* 添加悬停效果 */
        .absolute:hover {
            border-color: #3b82f6 !important;
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
        }
        #fatkun-drop-panel{
           display: none !important;
        }
        #fatkun-drop-panel-inner{
            display: none !important;
        }
    </style>
</head>
<body>
    ${originalHtml}
</body>
</html>`;

    // 创建 Blob URL
    const blob = new Blob([optimizedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // 设置 iframe src
    targetIframe.value.src = url;
}
const drawer = ref<Drawer>()

const initCanvas = () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    canvas.width = window.innerWidth - 20
    canvas.height = window.innerHeight - 20
    drawer.value = new Drawer({ view: canvas })
}

type AreaPoint = {
    startX: number
    startY: number
    endX: number
    endY: number
}
const areaPoint = reactive<AreaPoint>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
})

// 是否开始获取坐标
const startMove = ref(false)

const mouseDown = (e: MouseEvent) => {
    if (isDragging.value) return;
    startMove.value = true
    const { x, y } = e
    areaPoint.startX = x
    areaPoint.startY = y
}
const mouseMove = (e: MouseEvent) => {
    if (isDragging.value) return;
    if (startMove.value) {
        const { x, y } = e
        areaPoint.endX = x
        areaPoint.endY = y

        drawer.value?.clear()

        const { startX, startY, endX, endY } = areaPoint
        const rect = new Rectutils(
            { x: startX, y: startY, width: endX - startX, height: endY - startY, isFill: true,color: 'rgba(50, 205, 121, 0.3)' },
            'rect'
        )

        drawer.value?.add(rect)
    }
}
const mouseUp = (e: MouseEvent) => {
    if (isDragging.value) return;
    const { screenX, screenY } = e
    areaPoint.endX = screenX
    areaPoint.endY = screenY
    startMove.value = false
    drawer.value?.clear()
}


type RectInfo = {
    id: number
    x: number
    y: number
    width: number
    height: number
}

const rectInfoList = ref<RectInfo[]>([])

const getAllDomPoint = () => {
    // const getAllDom = document.querySelector('.rect-wrapper')!.children
    // for (const key of getAllDom) {
    //     const { x, y, width, height } = key.getBoundingClientRect()
    //     rectInfoList.value.push({
    //         id: Number((key as HTMLElement).dataset.id),
    //         x,
    //         y,
    //         width,
    //         height
    //     })
    // }
}




onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    initCanvas()
    window.addEventListener('mousedown', mouseDown)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseup', mouseUp)
    getAllDomPoint()
    // 延迟加载小地图，确保DOM完全加载
    setTimeout(() => {
        extractMinimap();
    }, 100);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    if (targetIframe.value && targetIframe.value.src.startsWith('blob:')) {
        URL.revokeObjectURL(targetIframe.value.src);
    }
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

.minimap {
    z-index: 1000;
    backdrop-filter: blur(8px);
}

.slider {
    width: 100%;
    height: 90%;
}

.slider__content {
    width: 100%;
    height: 100%;
    background: white;
}

.canvas {
    position: absolute;
    top: 0;
    left: 0;
    user-select: none;
    pointer-events: none;
}
</style>