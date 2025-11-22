<template>
  <Toast position="top-center" />
  <div class="canvas-container" ref="containerRef" @contextmenu.prevent="showContextMenu">
    <ContxtMenu ref="contextMenuRef" :menu-items="menuItems" class="z-dialog" />
    <div class="grid-bg" :style="gridStyle"></div>
    <div ref="canvasRef" class="canvas" :style="canvasStyle">
      <div
        v-for="(page, index) in pages"
        :key="index"
        :data-id="`id-key-${page.id}`"
        class="absolute rounded-lg cursor-pointer select-none transition-all duration-200 page-item"
        :style="{
          top: page.rect.y + 'px',
          left: page.rect.x + 'px',
          pointerEvents: 'auto',
          zIndex: 10,
          width: page.rect.width + 'px',
          height: page.rect.height + 'px',
        }"
        @click="handlePageClick($event, page)"
      >
        <BoardItem
          :width="page.rect.width"
          :height="page.rect.height"
          :cx="page.rect.width"
          :cy="page.rect.height"
          :boxshow="highRectList.has(`id-key-${page.id}`)"
        />

        <!-- 浮动菜单触发按钮 -->
        <Button
          icon="pi pi-equals"
          severity="secondary"
          variant="text"
          raised
          rounded
          aria-label="Bookmark"
          class="floating-trigger"
          @click.stop="toggleFloatingMenu($event, page)"
          :pt="{
            root: {
              style: {
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '32px',
                height: '32px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                zIndex: 20,
                opacity: 0,
                transition: 'opacity 0.2s ease',
              },
            },
          }"
        >
        </Button>
      </div>
    </div>

    <!-- 使用Teleport将浮动菜单渲染到body -->
    <Teleport to="body">
      <div
        v-if="floatingMenuVisible"
        class="global-floating-menu"
        :style="floatingMenuStyle"
        @click.stop
      >
        <SpeedDial
          :model="items"
          direction="up"
          :transitionDelay="80"
          :visible="floatingMenuVisible"
          @hide="closeFloatingMenu"
        >
          <template #item="{ item }">
            <div
              class="flex flex-col items-center justify-between gap-2 p-2 rounded w-10 cursor-pointer hover:bg-emerald-200 hover:text-gray-700"
              @click="handleActionClick(item)"
              :title="typeof item.label === 'function' ? item.label() : item.label"
            >
              <span :class="item.icon" class="p-2" />
            </div>
          </template>
        </SpeedDial>
      </div>
    </Teleport>

    <canvas id="canvas" class="canvas"></canvas>

    <div
      class="fixed bottom-4 right-4 text-white flex items-center justify-center gap-2 z-bar"
    >
      <!-- 历史记录撤回  -->
      <Button
        icon="pi pi-chevron-left"
        class="p-2 bg-black/70 hover:bg-black/80 rounded text-white"
        @click="handleUndo"
        :disabled="!canUndo"
      />
      <!-- 历史记录前进  -->
      <Button
        icon="pi pi-chevron-right"
        class="p-2 bg-black/70 hover:bg-black/80 rounded text-white"
        @click="handleRedo"
        :disabled="!canRedo"
      />

      <div class="bg-black/70 rounded text-xs flex items-center justify-center gap-1">
        <!-- 放大  -->
        <Button
          icon="pi pi-search-plus"
          class="hover:bg-black/80 rounded text-white bg-transparent"
          @click="zoomIn"
        />
        <div class="pl-1 pr-1">
          Scale: {{ transformRef.scale.toFixed(2) }} | X:
          {{ transformRef.x.toFixed(0) }} | Y:
          {{ transformRef.y.toFixed(0) }}
        </div>
        <Button
          icon="pi pi-search-minus"
          class="hover:bg-black/80 rounded text-white bg-transparent"
          @click="zoomOut"
        />
      </div>
      <Button @click="toggleGuides" class="">辅助线开关</Button>
    </div>

    <BoardLeft class="z-dialog" id="boardLeft" />
    <!-- 小地图区域 -->
    <div
      v-if="isMinimapVisible"
      class="fixed top-4 right-4 bg-white border border-gray-300 p-3 rounded-lg shadow-lg minimap w-64 h-96"
    >
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700">导航地图</span>
        <div class="flex space-x-1">
          <button
            @click="zoomInMinimap"
            class="p-1 rounded hover:bg-gray-200 text-gray-600"
            title="放大"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
          </button>
          <button
            @click="zoomOutMinimap"
            class="p-1 rounded hover:bg-gray-200 text-gray-600"
            title="缩小"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 12H4"
              ></path>
            </svg>
          </button>
          <button
            @click="refreshMinimap"
            class="p-1 rounded hover:bg-gray-200 text-gray-600"
            title="刷新"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
          </button>
          <button
            @click="toggleMinimap"
            class="p-1 rounded hover:bg-gray-200 text-gray-600"
            title="隐藏"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div
        class="slider w-full relative border border-gray-200 rounded overflow-hidden bg-white"
      >
        <iframe
          class="slider__content w-full h-full border-none"
          ref="targetIframe"
          sandbox="allow-same-origin"
          @load="onIframeLoad"
        />

        <!-- 视口指示器 -->
        <div
          class="absolute border-2 border-red-500 bg-red-200 bg-opacity-20 pointer-events-none transition-all duration-200"
          :style="viewportIndicatorStyle"
        ></div>
      </div>
    </div>
    <!-- 显示小地图的按钮（当隐藏时） -->
    <button
      v-else
      @click="toggleMinimap"
      class="fixed top-4 right-4 p-2 bg-primary-500 text-white rounded-lg shadow-lg hover:bg-red-400 transition-colors"
      title="显示导航地图"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        ></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
});
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, nextTick, reactive, type CSSProperties } from 'vue';
import { Drawer, Rect as Rectutils } from '~/utils/canvasExtend/drawer-ui';
import StorageIndexDB from '~/utils/storage';
import type { AreaPoint, MenuItem, RectInfo, WhithBoardItemProps as WhithBoardProps } from '~/types/type';
import { useEventManager } from '~/server/DomEvent';
import BoardItem from '~/components/Board/BoardItem.vue';
import BoardLeft from '~/components/Board/BoardLeft.vue';
import { useHistoryStore } from '~/store/HistoryStore';
import { useToast } from 'primevue/usetoast';

const historyStore = useHistoryStore();
const ContxtMenu = defineAsyncComponent(() => import('~/components/Contextmenu/index.vue'))

// DOM 引用
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);
const targetIframe = ref<HTMLIFrameElement | null>(null);

// 状态管理
const transformRef = ref({ x: 0, y: 0, scale: 1 });
const pages = ref<WhithBoardProps[]>([
    { rect: { x: 0, y: 0, width: 200, height: 200 }, type: '原点', background: '#e3f2fd', borderWidth: 1, borderColor: '#2196f3', id: 1, },
    { rect: { x: 500, y: 200, width: 200, height: 200 }, type: 'Rect 2', background: '#fff3e0', borderWidth: 1, borderColor: '#ff9800', id: 2 },
    { rect: { x: -300, y: 400, width: 200, height: 200 }, type: '负坐标测试', background: '#e8f5e9', borderWidth: 1, borderColor: '#4caf50', id: 3 }
]);
const WHITEBOARDPAGES = "whiteboard-pages"
const isGuide = ref(true);
const isMinimapVisible = ref(true);
const minimapZoom = ref(0.1);
const drawer = ref<Drawer>();
const rectInfoList = ref<Map<string, RectInfo>>(new Map());
const highRectList = ref<Set<string>>(new Set());
const contextMenuRef = ref()
const menuItems: MenuItem[] = [
    {
        key: 'copy',
        label: '粘贴',
        icon: 'EditCopy',
        handler: () => { }
    },
    {
        key: 'delete',
        label: '删除',
        icon: 'Delete',
        handler: () => { }
    },
    {
        label: '网格',
        icon: 'Grid',
        handler: () => {
            toggleGuides();
        },
        key: 'grid'
    },
    {
        label: '放大',
        icon: 'ZoomIn',
        handler: () => {
            zoomIn();
        },
        key: 'zoom-in'
    },
    {
        label: '缩小',
        icon: 'ZoomOut',
        handler: () => {
            zoomOut();
        },
        key: 'zoom-out'
    },
    {
        label: '重置',
        icon: 'Refresh',
        handler: () => {
            eventHandlers.reset();
        },
        key: 'reset'
    },
    {
        label: '隐藏/显示导航地图',
        icon: 'Minimap',
        handler: () => {
            toggleMinimap();
        },
        key: 'minimap'
    },
    {
        label: '保存',
        icon: 'Save',
        handler: () => {
            storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
        },
        key: 'save'
    }
]

// 计算属性：是否可以撤销/重做
const canUndo = computed(() => historyStore.cur > 0);
const canRedo = computed(() => historyStore.cur < historyStore.history.length - 1);

const showContextMenu = (e: MouseEvent) => {
    contextMenuRef.value?.show(e)
}

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

// 浮动菜单状态
const floatingMenuVisible = ref(false);
const floatingMenuPosition = ref({ x: 0, y: 0 });
const currentPageId = ref<number | null>(null);

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

const floatingMenuStyle = computed<CSSProperties>(() => ({
    position: 'fixed',
    left: `${floatingMenuPosition.value.x}px`,
    top: `${floatingMenuPosition.value.y}px`,
    zIndex: 10000,
}));

// 历史记录相关方法
const addHistory = () => {
    // 替换原第387行
    historyStore.addHistory(JSON.parse(JSON.stringify(pages.value)));
    storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
};

const handleUndo = () => {
    const previousState = historyStore.undo();
    if (previousState) {
        pages.value = JSON.parse(JSON.stringify(previousState));
        storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
        getAllDomPoint();
        refreshMinimap();
        highRectList.value.clear();
    }
};

const handleRedo = () => {
    const nextState = historyStore.redo();
    if (nextState) {
        pages.value = JSON.parse(JSON.stringify(nextState));
        storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
        getAllDomPoint();
        refreshMinimap();
        highRectList.value.clear();
    }
};

// 浮动菜单函数
const toggleFloatingMenu = (event: MouseEvent, page: WhithBoardProps) => {
    event.stopPropagation();

    console.log('toggleFloatingMenu', page.id, event);

    // 如果点击的是同一个页面且菜单已显示，则关闭
    if (floatingMenuVisible.value && currentPageId.value === page.id) {
        closeFloatingMenu();
        return;
    }

    currentPageId.value = page.id;

    // 获取页面元素在屏幕上的实际位置
    const pageElement = event.currentTarget as HTMLElement;
    const pageRect = pageElement.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 预估菜单尺寸
    const menuWidth = 200;
    const menuHeight = items.value.length * 60;

    // 计算按钮在屏幕上的位置（触发按钮在页面右上角）
    const buttonRect = {
        x: pageRect.right - 32, // 按钮宽度32px
        y: pageRect.top,
        width: 32,
        height: 32
    };

    // 计算按钮中心点
    const buttonCenterX = buttonRect.x + buttonRect.width / 2;
    const buttonCenterY = buttonRect.y + buttonRect.height / 2;

    // 根据按钮在视口中的位置决定最佳显示方向
    let preferredPosition = '';

    if (buttonCenterX > viewportWidth * 0.7 && buttonCenterY < viewportHeight * 0.3) {
        preferredPosition = 'bottom-left';
    } else if (buttonCenterX > viewportWidth * 0.7 && buttonCenterY > viewportHeight * 0.7) {
        preferredPosition = 'top-left';
    } else if (buttonCenterX < viewportWidth * 0.3 && buttonCenterY < viewportHeight * 0.3) {
        preferredPosition = 'bottom-right';
    } else if (buttonCenterX < viewportWidth * 0.3 && buttonCenterY > viewportHeight * 0.7) {
        preferredPosition = 'top-right';
    } else {
        preferredPosition = buttonCenterX > viewportWidth / 2 ? 'left' : 'right';
    }

    let finalX = buttonRect.x;
    let finalY = buttonRect.y;

    switch (preferredPosition) {
        case 'bottom-left':
            finalX = buttonRect.x - menuWidth + buttonRect.width;
            finalY = buttonRect.y + buttonRect.height + 5;
            break;
        case 'top-left':
            finalX = buttonRect.x - menuWidth + buttonRect.width;
            finalY = buttonRect.y - menuHeight - 5;
            break;
        case 'bottom-right':
            finalX = buttonRect.x + buttonRect.width + 5;
            finalY = buttonRect.y + buttonRect.height + 5;
            break;
        case 'top-right':
            finalX = buttonRect.x + buttonRect.width + 5;
            finalY = buttonRect.y - menuHeight - 5;
            break;
        case 'left':
            finalX = buttonRect.x - menuWidth - 5;
            finalY = buttonRect.y;
            break;
        case 'right':
        default:
            finalX = buttonRect.x + buttonRect.width + 5;
            finalY = buttonRect.y;
            break;
    }

    // 边界检查
    finalX = Math.max(5, Math.min(finalX, viewportWidth - menuWidth - 5));
    finalY = Math.max(5, Math.min(finalY, viewportHeight - menuHeight - 5));

    floatingMenuPosition.value = {
        x: finalX,
        y: finalY,
    };

    floatingMenuVisible.value = true;

};

const handleGlobalClick = (event: MouseEvent) => {
    if (!(event.target as HTMLElement).closest('.global-floating-menu')) {
        closeFloatingMenu();
    }
};

const closeFloatingMenu = () => {
    floatingMenuVisible.value = false;
    currentPageId.value = null;
};

const handleActionClick = (item: any) => {
    if (item.command) {
        item.command();
    }
};

// 页面点击处理
const handlePageClick = (event: MouseEvent, page: WhithBoardProps) => {
    // 如果点击的是浮动触发按钮，不处理页面点击
    if ((event.target as HTMLElement).closest('.floating-trigger')) {
        return;
    }

    clickPageItem(event);
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

const toast = useToast();
const router = useRouter();

const items = ref([
    {
        icon: 'pi pi-expand',
        label: '更改图形',
        command: () => {
            // 更改图形逻辑
            toast.add({ severity: 'info', summary: '图形', detail: '更改图形功能', life: 3000 });
            addHistory(); // 添加历史记录
        }
    },
    {
        icon: 'pi pi-palette',
        label: '更改颜色',
        command: () => {
            // 更改颜色逻辑
            toast.add({ severity: 'info', summary: '颜色', detail: '更改颜色功能', life: 3000 });
            addHistory(); // 添加历史记录
        }
    },
    {
        icon: 'pi pi-bullseye',
        label: '更改边框',
        command: () => {
            // 更改边框逻辑
            toast.add({ severity: 'info', summary: '边框', detail: '更改边框功能', life: 3000 });
            addHistory(); // 添加历史记录
        }
    },
    {
        icon: 'pi pi-comment',
        label: '评论',
        command: () => {
            // 评论逻辑
            toast.add({ severity: 'info', summary: '评论', detail: '添加评论功能', life: 3000 });
        }
    },
    {
        icon: 'pi pi-ellipsis-v',
        label: '更多设置',
        items: [
            {
                icon: 'pi pi-download',
                label: '导出',
                command: () => {
                    toast.add({ severity: 'info', summary: '导出', detail: '导出功能', life: 3000 });
                }
            },
            {
                icon: 'pi pi-copy',
                label: '复制',
                command: () => {
                    toast.add({ severity: 'info', summary: '复制', detail: '复制功能', life: 3000 });
                }
            },
            {
                icon: 'pi pi-trash',
                label: '删除',
                command: () => {
                    deletePageItem(); // 使用统一的删除方法
                }
            }
        ]
    }
]);

// 缩放功能
const zoomIn = () => {
    const newScale = Math.min(5, transformRef.value.scale * 1.2);
    transformRef.value.scale = newScale;
    initCanvas();
};

const zoomOut = () => {
    const newScale = Math.max(0.1, transformRef.value.scale / 1.2);
    transformRef.value.scale = newScale;
    initCanvas();
};

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
            //重新初始化画布
            initCanvas();
        } else {
            transformRef.value.x -= event.deltaX;
            transformRef.value.y -= event.deltaY;
        }
    },

    //重置画布
    reset(){
        transformRef.value = { x: 0, y: 0, scale: 1 };
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
                    this.reset();
                }
                break;
            case 'ControlLeft':
            case 'ControlRight':
                keyboardState.ctrlPressed = true;
                break;
            //保存按钮
            case 'KeyS':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
                    toast.add({ severity: 'success', summary: '保存', detail: '白板内容已保存', life: 2000 });
                }
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
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        handleRedo();
                    } else {
                        handleUndo();
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    handleRedo();
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

    //点击事件
    eventManager.addEventListeners([
        {
            element: containerRef.value,
            type: 'click',
            handler: handleGlobalClick
        }
    ]);
};

// 工具函数
const toggleGuides = () => {
    isGuide.value = !isGuide.value;
    toast.add({ severity: 'info', summary: '辅助线', detail: isGuide.value ? '已显示辅助线' : '已隐藏辅助线', life: 2000 });
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

    // 添加历史记录
    addHistory();
    refreshMinimap();
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

    // 添加历史记录
    addHistory();
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
        .floating-trigger {
            opacity: 1 !important;
        }
        #boardLeft{
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
    storageIndexDB.getData(WHITEBOARDPAGES).then((data) => {
        console.log("读取到的数据:", data);
        getAllDomPoint();
        //初始化历史系统
        historyStore.initHistory(data || pages.value);
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
        storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
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
  display: flex;
  justify-content: center;
  align-items: center;
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

/* 浮动菜单样式 */
.global-floating-menu {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  padding: 8px;
}

/* 页面悬停时显示浮动按钮 */
.page-item:hover .floating-trigger {
  opacity: 1 !important;
}

/* 按钮禁用样式 */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
