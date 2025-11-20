<template>
    <div class="canvas-container" ref="containerRef">
        <div class="grid-bg" :style="gridStyle"></div>
        <div ref="canvasRef" class="canvas" :style="canvasStyle">
            <div v-for="(page, index) in pages" :key="index" :data-id="`id-key-${page.id}`" @click="clickPageItem"
                class="absolute bg-white rounded-lg shadow-lg p-4 border-2 cursor-pointer select-none transition-all duration-200"
                :style="{
                    top: page.rect.y + 'px',
                    left: page.rect.x + 'px',
                    width: page.rect.width + 'px',
                    height: page.rect.height + 'px',
                    background: page.background,
                    borderWidth: page.borderWidth + 'px',
                    borderColor: highRectList.has(`id-key-${page.id}`) ? '#10b981' : page.borderColor,
                    boxShadow: highRectList.has(`id-key-${page.id}`)
                        ? '0 0 0 3px rgba(16, 185, 129, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    pointerEvents: 'auto',
                    zIndex: 10
                }">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ page.type }}</h3>
                <p class="text-gray-600">x: {{ page.rect.x }}, y: {{ page.rect.y }}</p>
                <BoardItem/>
            </div>
        </div>
        <canvas id="canvas" class="canvas"></canvas>

        <div
            class="fixed bottom-4 right-4 bg-black/70 text-white p-2 rounded text-xs flex items-center justify-center gap-2">
            Scale: {{ transformRef.scale.toFixed(2) }} | X: {{ transformRef.x.toFixed(0) }} | Y:
            {{ transformRef.y.toFixed(0) }}
            <Button @click="toggleGuides" class="">辅助线开关</Button>
        </div>

        <!-- 小地图区域 -->
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

import { ref, computed, onMounted, nextTick, reactive, type CSSProperties } from 'vue';
import { Drawer, Rect as Rectutils } from '~/utils/canvasExtend/drawer-ui';
import StorageIndexDB from '~/utils/storage';
import type { AreaPoint, RectInfo, WhithBoardItemProps as WhithBoardProps } from '~/types/type';
import { useEventManager } from '~/server/DomEvent';
import BoardItem from '~/components/Board/BoardItem.vue';
// DOM 引用
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);
const targetIframe = ref<HTMLIFrameElement | null>(null);

// 状态管理
const transformRef = ref({ x: 0, y: 0, scale: 1 });
const pages = ref<WhithBoardProps[]>([
    { rect: { x: 0, y: 0, width: 200, height: 150 }, type: '原点', background: '#e3f2fd', borderWidth: 1, borderColor: '#2196f3', id: 1, },
    { rect: { x: 500, y: 200, width: 200, height: 150 }, type: 'Rect 2', background: '#fff3e0', borderWidth: 1, borderColor: '#ff9800', id: 2 },
    { rect: { x: -300, y: 400, width: 200, height: 150 }, type: '负坐标测试', background: '#e8f5e9', borderWidth: 1, borderColor: '#4caf50', id: 3 }
]);

const isGuide = ref(true);
const isMinimapVisible = ref(true);
const minimapZoom = ref(0.1);
const drawer = ref<Drawer>();
const rectInfoList = ref<Map<string, RectInfo>>(new Map());
const highRectList = ref<Set<string>>(new Set());

// 交互状态
const interactionState = reactive({
    isDragging: false,
    startX: 0,
    startY: 0,
    startTranslateX: 0,
    startTranslateY: 0,
    isSelecting: false,
    areaPoint: {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0
    } as AreaPoint
});

// 键盘状态
const keyboardState = reactive({
    isSpacePressed: false,
    ctrlPressed: false
});

// 存储实例
const storageIndexDB = new StorageIndexDB();

// 计算属性
const guide = `
    linear-gradient(to right, #ddd 1px, transparent 1px),
    linear-gradient(to bottom, #ddd 1px, transparent 1px)
`;

const viewportIndicatorStyle = computed(() => {
    if (!containerRef.value) return {};

    const containerRect = containerRef.value.getBoundingClientRect();
    const viewportWidth = containerRect.width / transformRef.value.scale;
    const viewportHeight = containerRect.height / transformRef.value.scale;

    const viewportX = -transformRef.value.x / transformRef.value.scale;
    const viewportY = -transformRef.value.y / transformRef.value.scale;

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

const canvasStyle = computed<CSSProperties>(() => ({
    transform: `translate(${transformRef.value.x}px, ${transformRef.value.y}px) scale(${transformRef.value.scale})`,
    transformOrigin: '0 0',
    width: '0px',
    height: '0px',
    position: 'absolute',
    top: '0',
    left: '0',
    overflow: 'visible'
}));

const gridStyle = computed<CSSProperties>(() => {
    const { x, y, scale } = transformRef.value;
    const gridSize = 20 * scale;
    const guideText = isGuide.value ? guide : 'none';
    return {
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        backgroundPosition: `${x}px ${y}px`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundImage: guideText,
        pointerEvents: 'none'
    };
});

// 事件处理函数
const eventHandlers = {
    // 画布拖拽
    handleCanvasDragStart(e: MouseEvent) {
        if (e.button !== 0) return;
        if (!keyboardState.isSpacePressed) return
        interactionState.isDragging = true;
        interactionState.startX = e.clientX;
        interactionState.startY = e.clientY;
        interactionState.startTranslateX = transformRef.value.x;
        interactionState.startTranslateY = transformRef.value.y;

        if (containerRef.value) {
            containerRef.value.style.cursor = 'grabbing';
        }
    },

    handleCanvasDrag(e: MouseEvent) {
        if (!interactionState.isDragging) return;

        const offsetX = e.clientX - interactionState.startX;
        const offsetY = e.clientY - interactionState.startY;

        transformRef.value = {
            ...transformRef.value,
            x: interactionState.startTranslateX + offsetX,
            y: interactionState.startTranslateY + offsetY
        };
    },

    handleCanvasDragEnd() {
        interactionState.isDragging = false;
        if (containerRef.value) {
            containerRef.value.style.cursor = keyboardState.isSpacePressed ? 'grab' : 'default';
        }
    },

    // 滚轮缩放
    handleCanvasWheel(event: WheelEvent) {
        event.preventDefault();
        const { deltaY, clientX, clientY, ctrlKey, metaKey } = event;

        if (ctrlKey || metaKey) {
            if (!containerRef.value) return;

            const rect = containerRef.value.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const mouseY = clientY - rect.top;

            const zoomIntensity = 0.1;
            const wheel = deltaY < 0 ? 1 : -1;
            const newScale = Math.max(0.1, Math.min(5, transformRef.value.scale * (1 + wheel * zoomIntensity)));

            const scaleRatio = newScale / transformRef.value.scale;
            const newX = mouseX - (mouseX - transformRef.value.x) * scaleRatio;
            const newY = mouseY - (mouseY - transformRef.value.y) * scaleRatio;

            transformRef.value = { x: newX, y: newY, scale: newScale };
        } else {
            transformRef.value.x -= event.deltaX;
            transformRef.value.y -= event.deltaY;
        }
    },

    // 键盘事件
    handleKeyDown(e: KeyboardEvent) {
        switch (e.code) {
            case 'Space':
                if (!e.repeat) {
                    keyboardState.isSpacePressed = true;
                    if (containerRef.value) containerRef.value.style.cursor = 'grab';
                }
                break;
            case 'KeyR':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    transformRef.value = { x: 0, y: 0, scale: 1 };
                }
                break;
            case 'ControlLeft':
            case 'ControlRight':
                keyboardState.ctrlPressed = true;
                break;
        }

        // 复制粘贴删除
        if (keyboardState.ctrlPressed) {
            switch (e.key) {
                case 'c':
                    console.log('复制元素');
                    break;
                case 'v':
                    e.preventDefault();
                    pasteElement();
                    break;
            }
        }

        if (e.key === 'Delete') {
            deletePageItem();
        }
    },

    handleKeyUp(e: KeyboardEvent) {
        switch (e.code) {
            case 'Space':
                keyboardState.isSpacePressed = false;
                if (containerRef.value) containerRef.value.style.cursor = 'default';
                break;
            case 'ControlLeft':
            case 'ControlRight':
                keyboardState.ctrlPressed = false;
                break;
        }
    },

    // 框选事件
    handleSelectionStart(e: MouseEvent) {
        if (interactionState.isDragging) return;

        highRectList.value.clear();
        interactionState.isSelecting = true;

        const { clientX, clientY } = e;
        interactionState.areaPoint.startX = clientX;
        interactionState.areaPoint.startY = clientY;
    },

    handleSelectionMove(e: MouseEvent) {
        if (interactionState.isDragging || !interactionState.isSelecting) return;

        const { clientX, clientY } = e;
        interactionState.areaPoint.endX = clientX;
        interactionState.areaPoint.endY = clientY;

        // 绘制选择框
        drawer.value?.clear();
        const { startX, startY, endX, endY } = interactionState.areaPoint;
        const rect = new Rectutils(
            {
                x: startX,
                y: startY,
                width: endX - startX,
                height: endY - startY,
                isFill: true,
                color: 'rgba(50, 205, 121, 0.3)'
            },
            'rect'
        );
        drawer.value?.add(rect);

        // 计算选中元素
        if (interactionState.isSelecting) {
            rectInfoList.value.forEach((item) => {
                if (computedIsSelected(interactionState.areaPoint, item)) {
                    highRectList.value.add(item.id);
                }
            });
        }
    },

    handleSelectionEnd() {
        interactionState.isSelecting = false;
        drawer.value?.clear();
    },

    // 小地图事件
    handleMinimapClick(e: MouseEvent) {
        if (!targetIframe.value || !targetIframe.value.contentDocument) return;

        e.preventDefault();
        const iframeDoc = targetIframe.value.contentDocument;
        const rect = iframeDoc.documentElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        navigateToMinimapPosition(x, y);
    },

    handleMinimapHover() {
        if (targetIframe.value && targetIframe.value.contentDocument) {
            targetIframe.value.contentDocument.body.style.cursor = 'pointer';
        }
    }
};

// 初始化事件管理器
const eventManager = useEventManager();

// 初始化所有事件
const initializeEvents = () => {
    if (!containerRef.value) return;

    // 画布拖拽事件
    eventManager.addEventListeners([
        {
            element: containerRef.value,
            type: 'mousedown',
            handler: eventHandlers.handleCanvasDragStart
        },
        {
            element: document,
            type: 'mousemove',
            handler: eventHandlers.handleCanvasDrag
        },
        {
            element: document,
            type: 'mouseup',
            handler: eventHandlers.handleCanvasDragEnd
        }
    ]);

    // 滚轮事件（带节流）
    eventManager.addThrottledEventListener(
        containerRef.value,
        'wheel',
        eventHandlers.handleCanvasWheel,
        16
    );

    // 键盘事件
    eventManager.addEventListeners([
        {
            element: document,
            type: 'keydown',
            handler: eventHandlers.handleKeyDown
        },
        {
            element: document,
            type: 'keyup',
            handler: eventHandlers.handleKeyUp
        }
    ]);

    // 框选事件
    eventManager.addEventListeners([
        {
            element: window,
            type: 'mousedown',
            handler: eventHandlers.handleSelectionStart
        },
        {
            element: window,
            type: 'mousemove',
            handler: eventHandlers.handleSelectionMove
        },
        {
            element: window,
            type: 'mouseup',
            handler: eventHandlers.handleSelectionEnd
        }
    ]);
};

// 工具函数
const toggleGuides = () => {
    isGuide.value = !isGuide.value;
};

const initCanvas = () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawer.value = new Drawer({ view: canvas });
};

const getAllDomPoint = () => {
    nextTick(() => {
        if (!canvasRef.value) return;
        for (const key of canvasRef.value.children) {
            const id = key.getAttribute('data-id') || '';
            const { x, y, width, height } = key.getBoundingClientRect();
            rectInfoList.value.set(id, {
                id: (key as HTMLElement).dataset.id || '',
                x,
                y,
                width,
                height,
            });
        }
        console.log('rectInfoList', rectInfoList.value);
    });
};

const computedIsSelected = (areaPoint: AreaPoint, rectInfo: RectInfo) => {
    const { startX, startY, endX, endY } = areaPoint;
    let { x, y, width, height } = rectInfo;

    x = x * transformRef.value.scale + transformRef.value.x;
    y = y * transformRef.value.scale + transformRef.value.y;
    width = width * transformRef.value.scale;
    height = height * transformRef.value.scale;

    const finalStartX = startX > endX ? endX : startX;
    const finalStartY = startY > endY ? endY : startY;
    const finalEndX = startX > endX ? startX : endX;
    const finalEndY = startY > endY ? startY : endY;

    const rectPointTopLeft = { x, y };
    const rectPointTopRight = { x: x + width, y };
    const rectPointBottomLeft = { x, y: y + height };
    const rectPointBottomRight = { x: x + width, y: y + height };

    return (
        (rectPointTopLeft.x >= finalStartX && rectPointTopLeft.x <= finalEndX && rectPointTopLeft.y >= finalStartY && rectPointTopLeft.y <= finalEndY) ||
        (rectPointTopRight.x >= finalStartX && rectPointTopRight.x <= finalEndX && rectPointTopRight.y >= finalStartY && rectPointTopRight.y <= finalEndY) ||
        (rectPointBottomLeft.x >= finalStartX && rectPointBottomLeft.x <= finalEndX && rectPointBottomLeft.y >= finalStartY && rectPointBottomLeft.y <= finalEndY) ||
        (rectPointBottomRight.x >= finalStartX && rectPointBottomRight.x <= finalEndX && rectPointBottomRight.y >= finalStartY && rectPointBottomRight.y <= finalEndY) ||
        (rectPointTopLeft.x <= finalStartX && rectPointTopRight.x >= finalStartX && rectPointTopLeft.y <= finalStartY && rectPointBottomLeft.y >= finalStartY) ||
        (rectPointTopLeft.x <= finalEndX && rectPointTopRight.x >= finalEndX && rectPointTopLeft.y <= finalEndY && rectPointBottomLeft.y >= finalEndY) ||
        (rectPointTopLeft.x <= finalStartX && rectPointTopRight.x >= finalStartX && rectPointTopLeft.x <= finalEndX && rectPointTopRight.x >= finalEndX && rectPointTopLeft.y >= finalStartY && rectPointBottomLeft.y <= finalEndY) ||
        (rectPointTopLeft.y <= finalStartY && rectPointBottomLeft.y >= finalStartY && rectPointTopLeft.y <= finalEndY && rectPointBottomLeft.y >= finalEndY && rectPointTopLeft.x >= finalStartX && rectPointBottomRight.x <= finalEndX)
    );
};

const pasteElement = () => {
    const newElements: WhithBoardProps[] = [];
    pages.value.forEach((item) => {
        if (highRectList.value.has(`id-key-${item.id}`)) {
            const newId = Date.now() + Math.floor(Math.random() * 1000);
            const newElement: WhithBoardProps = {
                id: newId,
                type: item.type,
                rect: {
                    x: item.rect.x + 20,
                    y: item.rect.y + 20,
                    width: item.rect.width,
                    height: item.rect.height,
                },
                background: item.background,
                borderWidth: item.borderWidth,
                borderColor: item.borderColor,
            };
            newElements.push(newElement);
            rectInfoList.value.set(`id-key-${newId}`, {
                id: `id-key-${newId}`,
                x: newElement.rect.x,
                y: newElement.rect.y,
                width: newElement.rect.width,
                height: newElement.rect.height,
            });
        }
    });
    pages.value.push(...newElements);
    refreshMinimap();
    storageIndexDB.saveData(pages.value, "whiteboard-pages");
};

const clickPageItem = (e: MouseEvent) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const id = target.getAttribute('data-id') || '';
    if (highRectList.value.has(id)) {
        highRectList.value.delete(id);
    } else {
        highRectList.value.add(id);
    }
};

const deletePageItem = () => {
    const highRectKeys = new Set(Array.from(highRectList.value.keys()));

    pages.value = pages.value.filter((item) => {
        return !highRectKeys.has(`id-key-${item.id}`);
    });

    highRectKeys.forEach((key) => {
        if (rectInfoList.value.has(key)) {
            rectInfoList.value.delete(key);
        }
    });
    storageIndexDB.saveData(pages.value, "whiteboard-pages");
};
// 小地图功能
const zoomInMinimap = () => {
    if (minimapZoom.value < 0.5) {
        minimapZoom.value += 0.05;
        refreshMinimap();
    }
};

const zoomOutMinimap = () => {
    if (minimapZoom.value > 0.05) {
        minimapZoom.value -= 0.05;
        refreshMinimap();
    }
};

const refreshMinimap = () => {
    extractMinimap();
};

const toggleMinimap = () => {
    isMinimapVisible.value = !isMinimapVisible.value;
};

const navigateToMinimapPosition = (minimapX: number, minimapY: number) => {
    if (!containerRef.value) return;

    const containerRect = containerRef.value.getBoundingClientRect();
    const worldX = minimapX / minimapZoom.value;
    const worldY = minimapY / minimapZoom.value;

    const targetX = -worldX * transformRef.value.scale + containerRect.width / 2;
    const targetY = -worldY * transformRef.value.scale + containerRect.height / 2;

    transformRef.value = {
        ...transformRef.value,
        x: targetX,
        y: targetY
    };
};

const onIframeLoad = () => {
    if (!targetIframe.value || !targetIframe.value.contentDocument) return;

    const iframeDoc = targetIframe.value.contentDocument;

    // 使用事件管理器绑定小地图事件
    eventManager.addEventListener(iframeDoc, 'click', eventHandlers.handleMinimapClick);
    eventManager.addEventListener(iframeDoc, 'mousemove', eventHandlers.handleMinimapHover);
};

const extractMinimap = () => {
    if (!targetIframe.value) return;

    const originalHtml = document.documentElement.outerHTML;
    const optimizedHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
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
        .minimap { 
            display: none !important; 
        }
        .fixed.bottom-4.right-4 {
            display: none !important;
        }
        .canvas-container {
            overflow: visible !important;
        }
        .canvas {
            transform: none !important;
        }
        .absolute {
            border: 1px solid rgba(0,0,0,0.2) !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
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

    const blob = new Blob([optimizedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    targetIframe.value.src = url;

    // 添加清理函数
    eventManager.addCleanup(() => {
        if (targetIframe.value && targetIframe.value.src.startsWith('blob:')) {
            URL.revokeObjectURL(targetIframe.value.src);
        }
    });
};

// 生命周期
onMounted(() => {
    // 数据读取
    storageIndexDB.getData("whiteboard-pages").then((data) => {
        console.log("读取到的数据:", data);
        getAllDomPoint();
    });

    // 初始化事件
    initializeEvents();

    // 初始化画布
    initCanvas();

    // 延迟加载小地图
    setTimeout(() => {
        extractMinimap();
    }, 100);

    // 添加存储清理
    eventManager.addCleanup(() => {
        storageIndexDB.saveData(pages.value, "whiteboard-pages");
        storageIndexDB.close();
    });
});

// 组件卸载时自动清理所有事件
onUnmounted(() => {
    eventManager.cleanupAll();
});
</script>

<style scoped>
.canvas-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    background: #f8f9fa;
    touch-action: none;
}

.grid-bg {
    pointer-events: none;
}

.canvas {
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