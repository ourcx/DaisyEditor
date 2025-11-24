<template>
  <!--      @mousedown="eventHandlers.onMouseDown($event, page)" -->
  <BoardMeun class="z-dialog" id="boardMenu" :visible="doubleClickMenuState.visible"
    :x="doubleClickMenuState.position.x" :y="doubleClickMenuState.position.y" @action="ClickBoardMeun" />
  <Toast position="top-center" />
  <div class="canvas-container" ref="containerRef" @contextmenu.prevent="showContextMenu">
    <ContxtMenu ref="contextMenuRef" :menu-items="menuItems" class="z-dialog" />
    <div class="grid-bg" :style="gridStyle"></div>
    <div ref="canvasRef" class="canvas" :style="canvasStyle">
      <div v-for="(page, index) in pages" :key="index" :data-id="`id-key-${page.id}`" :id="`${page.id}`"
        class="absolute rounded-lg cursor-pointer select-none  duration-200 page-item" :style="{
          top: page.rect.y + 'px',
          left: page.rect.x + 'px',
          pointerEvents: 'auto',
          zIndex: 10,
          width: page.rect.width + 'px',
          height: page.rect.height + 'px',
        }" @click="handlePageClick($event, page)" draggable="true">
        <BoardItem :width="page.rect.width" :height="page.rect.height" :cx="page.rect.width" :cy="page.rect.height"
          :boxshow="highRectList.has(`id-key-${page.id}`)" :id="page.id" @update:size="handleSizeUpdate"
          :scaleX="page.rect.scaleX" :scaleY="page.rect.scaleY" :color="page.background" :shape="page.type"
          :strokeColor="page.borderColor" :strokeWidth="page.borderWidth" :image="page.image || ''"
          :filter="page.filter" />

        <!-- 浮动菜单触发按钮 -->
        <Button icon="pi pi-equals" severity="secondary" variant="text" raised rounded aria-label="Bookmark"
          class="floating-trigger" @click.stop="toggleFloatingMenu($event, page)" :pt="{
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
          }">
        </Button>
      </div>
    </div>

    <!-- 使用Teleport将浮动菜单渲染到body -->
    <Teleport to="body">
      <div v-if="floatingMenuVisible" class="global-floating-menu" :style="floatingMenuStyle" @click.stop>
        <div class="floating-menu-content">
          <!-- 颜色选择器 -->
          <div v-if="currentSubMenu === 'color'" class="sub-menu-section">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium">选择颜色</span>
              <Button icon="pi pi-times" text rounded @click="currentSubMenu = null" />
            </div>
            <ColorPicker v-model="colorValue" format="hex" />
            <div class="flex gap-2 mt-3">
              <Button label="应用" size="small" @click="applyColorChange" />
              <Button label="取消" severity="secondary" size="small" @click="currentSubMenu = null" />
            </div>
          </div>

          <!-- 形状选择器 -->
          <div v-else-if="currentSubMenu === 'shape'" class="sub-menu-section">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium">选择形状</span>
              <Button icon="pi pi-times" text rounded @click="currentSubMenu = null" />
            </div>
            <div class="shape-grid">
              <div v-for="shape in availableShapes" :key="shape.id" class="shape-item"
                :class="{ active: shape.id === selectedShape }" @click="selectShape(shape.id)">
                <div class="shape-preview" :class="`shape-${shape.id}`"></div>
                <span class="shape-label">{{ shape.label }}</span>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <Button label="应用" size="small" @click="applyShapeChange" />
              <Button label="取消" severity="secondary" size="small" @click="currentSubMenu = null" />
            </div>
          </div>

          <!-- 边框设置 -->
          <div v-else-if="currentSubMenu === 'border'" class="sub-menu-section">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium">边框设置</span>
              <Button icon="pi pi-times" text rounded @click="currentSubMenu = null" />
            </div>

            <div class="border-controls">
              <div class="control-group">
                <label class="control-label">边框宽度</label>
                <InputNumber v-model="borderWidth" :min="0" :max="10" :step="1" showButtons buttonLayout="horizontal"
                  class="w-full" />
              </div>

              <div class="control-group">
                <label class="control-label">边框颜色</label>
                <ColorPicker v-model="borderColor" format="hex" />
              </div>
            </div>

            <div class="flex gap-2 mt-3">
              <Button label="应用" size="small" @click="applyBorderChange" />
              <Button label="取消" severity="secondary" size="small" @click="currentSubMenu = null" />
            </div>
          </div>

          <!-- 文本设置 -->
          <div v-else-if="currentSubMenu === 'text'" class="sub-menu-section">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium">文本设置</span>
              <Button icon="pi pi-times" text rounded @click="currentSubMenu = null" />
            </div>

            <div class="text-controls">
              <div class="control-group">
                <label class="control-label">文本内容</label>
                <InputText v-model="textContent" placeholder="输入文本内容" class="w-full" />
              </div>

              <div class="control-group">
                <label class="control-label">字体大小</label>
                <InputNumber v-model="textSize" :min="8" :max="72" :step="2" showButtons buttonLayout="horizontal"
                  class="w-full" />
              </div>

              <div class="control-group">
                <label class="control-label">字体粗细</label>
                <Dropdown v-model="textWeight" :options="fontWeightOptions" optionLabel="label" optionValue="value"
                  class="w-full" />
              </div>
            </div>

            <div class="flex gap-2 mt-3">
              <Button label="应用" size="small" @click="applyTextChange" />
              <Button label="取消" severity="secondary" size="small" @click="currentSubMenu = null" />
            </div>
          </div>

          <!-- 主菜单 -->
          <div v-else class="menu-items-grid">
            <div v-for="item in floatingMenuItems" :key="item.id" class="menu-item" @click="handleFloatingAction(item)"
              :class="{ disabled: item.requireText && currentPageType !== 'Text' }">
              <i :class="item.icon" class="menu-icon"></i>
              <span class="menu-label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <canvas id="canvas" class="canvas"></canvas>

    <div class="fixed bottom-4 right-4 text-white flex items-center justify-center gap-2 z-bar">
      <!-- 历史记录撤回  -->
      <Button icon="pi pi-chevron-left" class="p-2 bg-black/70 hover:bg-black/80 rounded text-white" @click="handleUndo"
        :disabled="!canUndo" />
      <!-- 历史记录前进  -->
      <Button icon="pi pi-chevron-right" class="p-2 bg-black/70 hover:bg-black/80 rounded text-white"
        @click="handleRedo" :disabled="!canRedo" />

      <div class="bg-black/70 rounded text-xs flex items-center justify-center gap-1">
        <!-- 放大  -->
        <Button icon="pi pi-search-plus" class="hover:bg-black/80 rounded text-white bg-transparent" @click="zoomIn" />
        <div class="pl-1 pr-1">
          Scale: {{ transformRef.scale.toFixed(2) }} | X:
          {{ transformRef.x.toFixed(0) }} | Y:
          {{ transformRef.y.toFixed(0) }}
        </div>
        <Button icon="pi pi-search-minus" class="hover:bg-black/80 rounded text-white bg-transparent"
          @click="zoomOut" />
      </div>
      <Button @click="toggleGuides" class="">辅助线开关</Button>
    </div>

    <BoardLeft class="z-dialog" id="boardLeft" />
    <!-- 小地图区域 -->
    <div v-if="isMinimapVisible"
      class="fixed top-4 right-4 bg-white border border-gray-300 p-3 rounded-lg shadow-lg minimap w-64 h-96">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700">导航地图</span>
        <div class="flex space-x-1">
          <button @click="zoomInMinimap" class="p-1 rounded hover:bg-gray-200 text-gray-600" title="放大">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="slider w-full relative border border-gray-200 rounded overflow-hidden bg-white">
        <iframe class="slider__content w-full h-full border-none" ref="targetIframe" sandbox="allow-same-origin"
          @load="onIframeLoad" />

        <!-- 视口指示器 -->
        <div
          class="absolute border-2 border-red-500 bg-red-200 bg-opacity-20 pointer-events-none transition-all duration-200"
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
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, nextTick, reactive, type CSSProperties } from 'vue';
import { Drawer, Rect as Rectutils } from '~/utils/canvasExtend/drawer-ui';
import StorageIndexDB from '~/utils/storage';
import type { AreaPoint, MenuData, MenuItem, RectInfo, WhithBoardItemProps as WhithBoardProps } from '~/types/type';
import { useEventManager } from '~/server/DomEvent';
import BoardItem from '~/components/Board/BoardItem.vue';
import BoardLeft from '~/components/Board/BoardLeft.vue';
import { useHistoryStore } from '~/store/HistoryStore';
import { useToast } from 'primevue/usetoast';
import BoardMeun from '~/components/Board/BoardMeun.vue';
import type { menuData, Shape } from '~/types/components/type';

const historyStore = useHistoryStore();
const ContxtMenu = defineAsyncComponent(() => import('~/components/Contextmenu/index.vue'))

// DOM 引用
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);
const targetIframe = ref<HTMLIFrameElement | null>(null);

// 状态管理
const transformRef = ref({ x: 0, y: 0, scale: 1 });
const pages = ref<WhithBoardProps[]>([
  { rect: { x: 0, y: 0, width: 200, height: 200 }, type: 'circle', background: '#e3f2fd', borderWidth: 2, borderColor: '#2196f3', id: 1, },
  { rect: { x: 500, y: 200, width: 200, height: 200 }, type: 'Rect', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 2 },
  { rect: { x: -300, y: 400, width: 200, height: 200 }, type: 'Line', background: '#e8f5e9', borderWidth: 2, borderColor: '#4caf50', id: 3 },
  { rect: { x: 1000, y: 400, width: 200, height: 200 }, type: 'Image', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 4, image: 'https://s2.loli.net/2025/11/15/fQ5bv8o2cxuC9da.jpg', filter: 'blur' },
  { rect: { x: 800, y: 800, width: 200, height: 200 }, type: 'Image', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 5, image: 'https://s2.loli.net/2025/11/15/fQ5bv8o2cxuC9da.jpg', filter: 'grayscale' },
  { rect: { x: 1000, y: 200, width: 200, height: 200 }, type: 'Image', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 6, image: 'https://s2.loli.net/2025/11/15/fQ5bv8o2cxuC9da.jpg', filter: 'invert' },
  { rect: { x: 500, y: 400, width: 200, height: 200 }, type: 'Text', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 7, text: 'Hello World' },
  { rect: { x: 800, y: 400, width: 200, height: 200 }, type: 'Rect', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 8 },
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
const curPage = ref<string>('');
//当前的菜单元素
// 计算属性：是否可以撤销/重做
const canUndo = computed(() => historyStore.cur > 0);
const canRedo = computed(() => historyStore.cur < historyStore.history.length - 1);
const colorValue = ref<string>('e3f2fd');
const currentSubMenu = ref<string | null>(null);
const selectedShape = ref<Shape>('circle');
const borderWidth = ref<number>(1);
const borderColor = ref<string>('2196f3');
const textContent = ref<string>('文本');
const textSize = ref<number>(16);
const textWeight = ref<string>('normal');
const currentPageType = ref<string>('');
// 可用的形状类型
const availableShapes: MenuData[] = [
  { id: 'circle', label: '圆形', icon: 'pi pi-circle' },
  { id: 'Rect', label: '矩形', icon: 'pi pi-square' },
  { id: 'Line', label: '线条', icon: 'pi pi-minus' },
  { id: 'Text', label: '文本', icon: 'pi pi-font' },
  { id: 'Curve', label: '曲线', icon: 'pi pi-chart-line' },
  { id: 'Area', label: '区域', icon: 'pi pi-objects-column' },
  { id: 'Arc', label: '弧形', icon: 'pi pi-arrow-right-arrow-left' },
  { id: 'Pie', label: '饼图', icon: 'pi pi-chart-pie' }
];

// 字体粗细选项
const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '100', value: '100' },
  { label: '200', value: '200' },
  { label: '300', value: '300' },
  { label: '400', value: '400' },
  { label: '500', value: '500' },
  { label: '600', value: '600' },
  { label: '700', value: '700' },
  { label: '800', value: '800' },
  { label: '900', value: '900' }
];

const showContextMenu = (e: MouseEvent) => {
  contextMenuRef.value?.show(e)
}
//拖动偏移量
const mousedownOffset = reactive({
  x: 0,
  y: 0,
})
const dragState = reactive({
  isDragging: false,
  dragPageId: null as number | null,
  startX: 0,
  startY: 0,
  startPageX: 0,
  startPageY: 0,
  dragElement: null as HTMLElement | null  // 新增：用于存储正在拖拽的元素
});

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
//双击菜单状态
const doubleClickMenuState = reactive({
  visible: false,
  position: { x: 0, y: 0 },
})
//双击菜单事件监听


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


const handleGlobalClick = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.global-floating-menu')) {
    closeFloatingMenu();
  }
};

//浮动菜单
const handleActionClick = (item: any) => {
  if (item.command) {
    item.command();
  }
};
//菜单颜色
const handleFloatingAction = (item: any) => {
  if (item.requireText && currentPageType.value !== 'Text') {
    toast.add({
      severity: 'warn',
      summary: '操作提示',
      detail: '此功能仅适用于文本元素',
      life: 2000
    });
    return;
  }

  if (item.command) {
    item.command();
  }
};

// 选择形状
const selectShape = (shapeId: Shape) => {
  selectedShape.value = shapeId;
};

// 应用形状更改
const applyShapeChange = () => {
  if (currentPageId.value) {
    pages.value = pages.value.map(page => {
      if (page.id === currentPageId.value) {
        const updatedPage = {
          ...page,
          type: selectedShape.value
        };

        // 如果是文本类型，确保有默认文本属性
        if (selectedShape.value === 'Text') {
          if (!updatedPage.text) updatedPage.text = '文本';
          if (!updatedPage.textSize) updatedPage.textSize = 16;
          if (!updatedPage.textWeight) updatedPage.textWeight = 'normal';
        }

        return updatedPage;
      }
      return page;
    });

    saveAndNotify('形状', `图形已更改为${availableShapes.find(s => s.id === selectedShape.value)?.label}`);
    currentSubMenu.value = null;
  }
};

// 应用颜色更改
const applyColorChange = () => {
  if (currentPageId.value) {
    pages.value = pages.value.map(page => {
      if (page.id === currentPageId.value) {
        return {
          ...page,
          background: '#' + colorValue.value
        };
      }
      return page;
    });

    saveAndNotify('颜色', '页面颜色已更新');
    currentSubMenu.value = null;
  }
};

// 应用边框更改
const applyBorderChange = () => {
  if (currentPageId.value) {
    console.log('applyBorderChange', borderWidth.value, borderColor.value);
    pages.value = pages.value.map(page => {
      if (page.id === currentPageId.value) {
        return {
          ...page,
          borderWidth: borderWidth.value,
          borderColor: '#' + borderColor.value.replace('#', '')
        };
      }
      return page;
    });

    saveAndNotify('边框', '边框设置已更新');
    currentSubMenu.value = null;
  }
};

// 应用文本更改
const applyTextChange = () => {
  if (currentPageId.value) {
    pages.value = pages.value.map(page => {
      if (page.id === currentPageId.value) {
        return {
          ...page,
          text: textContent.value,
          textSize: textSize.value,
          textWeight: textWeight.value
        };
      }
      return page;
    });

    saveAndNotify('文本', '文本设置已更新');
    currentSubMenu.value = null;
  }
};

// 保存并通知的通用方法
const saveAndNotify = (summary: string, detail: string) => {
  storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
  addHistory();

  toast.add({
    severity: 'success',
    summary,
    detail,
    life: 2000
  });
};

// 复制页面
const duplicatePage = () => {
  if (currentPageId.value) {
    const originalPage = pages.value.find(page => page.id === currentPageId.value);
    if (originalPage) {
      const newPage = {
        ...JSON.parse(JSON.stringify(originalPage)),
        id: Date.now(),
        rect: {
          ...originalPage.rect,
          x: originalPage.rect.x + 30,
          y: originalPage.rect.y + 30
        }
      };
      pages.value.push(newPage);
      saveAndNotify('复制', '页面已复制');
      closeFloatingMenu();
    }
  }
};

// 删除当前页面
const deleteCurrentPage = () => {
  if (currentPageId.value) {
    pages.value = pages.value.filter(page => page.id !== currentPageId.value);
    saveAndNotify('删除', '页面已删除');
    closeFloatingMenu();
  }
};

// 置顶
const bringToFront = () => {
  if (currentPageId.value) {
    const pageIndex = pages.value.findIndex(page => page.id === currentPageId.value);
    if (pageIndex > -1) {
      const [page] = pages.value.splice(pageIndex, 1);
      pages.value.push(page!);
      saveAndNotify('置顶', '元素已置顶');
      closeFloatingMenu();
    }
  }
};

// 置底
const sendToBack = () => {
  if (currentPageId.value) {
    const pageIndex = pages.value.findIndex(page => page.id === currentPageId.value);
    if (pageIndex > -1) {
      const [page] = pages.value.splice(pageIndex, 1);
      pages.value.unshift(page!);
      saveAndNotify('置底', '元素已置底');
      closeFloatingMenu();
    }
  }
};


const imageSetting = () => {
  //图片设置滤镜

}

// 修改 toggleFloatingMenu 函数，添加状态初始化
const toggleFloatingMenu = (event: MouseEvent, page: WhithBoardProps) => {
  event.stopPropagation();

  // 如果点击的是同一个页面且菜单已显示，则关闭
  if (floatingMenuVisible.value && currentPageId.value === page.id) {
    closeFloatingMenu();
    return;
  }

  currentPageId.value = page.id;
  currentPageType.value = page.type;
  colorValue.value = page.background;
  selectedShape.value = page.type;
  borderWidth.value = page.borderWidth;
  borderColor.value = page.borderColor;
  textContent.value = page.text || '文本';
  textSize.value = page.textSize || 16;
  textWeight.value = page.textWeight || 'normal';
  currentSubMenu.value = null;

  // 获取页面元素在屏幕上的实际位置
  const pageElement = event.currentTarget as HTMLElement;
  const pageRect = pageElement.getBoundingClientRect();

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 菜单尺寸
  const menuWidth = 200;
  const menuHeight = 240;

  // 计算菜单位置 - 在页面元素右侧显示
  let finalX = pageRect.right + 10;
  let finalY = pageRect.top;

  // 边界检查
  if (finalX + menuWidth > viewportWidth - 10) {
    // 如果右侧空间不足，显示在左侧
    finalX = pageRect.left - menuWidth - 10;
  }

  if (finalY + menuHeight > viewportHeight - 10) {
    // 如果下方空间不足，向上调整
    finalY = viewportHeight - menuHeight - 10;
  }

  floatingMenuPosition.value = {
    x: Math.max(10, finalX),
    y: Math.max(10, finalY),
  };

  floatingMenuVisible.value = true;
};

// 关闭浮动菜单
const closeFloatingMenu = () => {
  floatingMenuVisible.value = false;
  currentPageId.value = null;
  currentSubMenu.value = null;
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
    highRectList.value.clear();
    highRectList.value.add(id);
  }
};

const toast = useToast();
const router = useRouter();

const floatingMenuItems = ref([
  {
    id: 'change-shape',
    icon: 'pi pi-expand',
    label: '更改图形',
    command: () => {
      currentSubMenu.value = 'shape';
    }
  },
  {
    id: 'change-color',
    icon: 'pi pi-palette',
    label: '更改颜色',
    command: () => {
      currentSubMenu.value = 'color';
    }
  },
  {
    id: 'change-border',
    icon: 'pi pi-bullseye',
    label: '更改边框',
    command: () => {
      currentSubMenu.value = 'border';
    }
  },
  {
    id: 'change-text',
    icon: 'pi pi-amazon',
    label: '文本设置',
    command: () => {
      currentSubMenu.value = 'text';
    },
    requireText: true
  },
  {
    id: 'duplicate',
    icon: 'pi pi-copy',
    label: '复制',
    command: () => {
      duplicatePage();
    }
  },
  {
    id: 'delete',
    icon: 'pi pi-trash',
    label: '删除',
    command: () => {
      deleteCurrentPage();
    }
  },
  {
    id: 'bring-to-front',
    icon: 'pi pi-arrow-up',
    label: '置顶',
    command: () => {
      bringToFront();
    }
  },
  {
    id: 'send-to-back',
    icon: 'pi pi-arrow-down',
    label: '置底',
    command: () => {
      sendToBack();
    }
  },
  //图片设置，滤镜什么的
  {
    id: 'image-setting',
    icon: 'pi pi-cog',
    label: '图片设置',
    command: () => {
      imageSetting();
    }
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

// 在父组件中修改 handleSizeUpdate
const handleSizeUpdate = (newScale: { width: number; height: number; scaleX: number; scaleY: number }, id: number) => {
  console.log('Size update:', newScale);

  pages.value = pages.value.map((page) => {
    if (page.id === id) {
      // 计算中心点保持不变的位置偏移
      const centerX = page.rect.x + page.rect.width / 2;
      const centerY = page.rect.y + page.rect.height / 2;

      const newX = centerX - newScale.width / 2;
      const newY = centerY - newScale.height / 2;

      return {
        ...page,
        rect: {
          ...page.rect,
          width: newScale.width,
          height: newScale.height,
          x: newX,
          y: newY,
          scaleX: newScale.scaleX,
          scaleY: newScale.scaleY
        }
      }
    }
    return page;
  });

  // 保存到数据库
  storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
  addHistory()
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
  reset() {
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
    //关闭双击菜单
    doubleClickMenuState.visible = false;
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
  },
  //双击屏幕弹出插入图形窗口

  handleCanvasDoubleClick(e: MouseEvent) {
    if (interactionState.isDragging) return;
    if (interactionState.isSelecting) return;
    doubleClickMenuState.visible = !doubleClickMenuState.visible;
    doubleClickMenuState.position = { x: e.clientX, y: e.clientY };
  },

  onMouseDown(event: MouseEvent) {
    // 开始的时候暂停鼠标框选
    interactionState.isSelecting = true;
    event.stopPropagation();

    if (!event.target) return;

    // 拿到id
    dragState.isDragging = true;
    const target = event.target as HTMLElement;
    dragState.dragPageId = target.id ? parseInt(target.id, 10) : null;

    // 保存正在拖拽的元素引用
    dragState.dragElement = target;

    // 设置拖拽元素透明度为0
    if (dragState.dragElement) {
      dragState.dragElement.style.opacity = '0';
    }

    // 从pages拿到数据
    const page = pages.value.find((page) => page.id === dragState.dragPageId);
    if (!page) return;

    // 记录初始状态
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.startPageX = page.rect.x;
    dragState.startPageY = page.rect.y;
    drawer.value?.clear();
  },


  onMouseMove(event: MouseEvent) {
    if (!dragState.isDragging || dragState.dragPageId === null) return;

    event.stopPropagation();

    // 计算位移（考虑画布缩放）
    let deltaX = (event.clientX - dragState.startX) / transformRef.value.scale;
    let deltaY = (event.clientY - dragState.startY) / transformRef.value.scale;

    // 更新页面数据 - 使用不可变更新
    pages.value = pages.value.map(page => {
      if (page.id === dragState.dragPageId) {

        return {
          ...page,
          rect: {
            ...page.rect,
            x: dragState.startPageX + deltaX,
            y: dragState.startPageY + deltaY
          }
        };
      }
      return page;
    });
    drawer.value?.clear();

  },

  onMouseup(event: MouseEvent) {
    console.log("onMouseup", event);
    event.stopPropagation();

    // 恢复拖拽元素的透明度
    if (dragState.dragElement) {
      dragState.dragElement.style.opacity = '';
      dragState.dragElement = null;
    }

    // 重置拖拽状态
    dragState.isDragging = false;
    dragState.dragPageId = null;

    console.log('拖拽结束，当前页面数据:', pages.value);

    // 保存数据
    storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
    // 历史记录
    addHistory();
    getAllDomPoint();
    // 允许鼠标框选
    eventHandlers.handleSelectionEnd()
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
    },
    //单击其他地方关闭双击菜单
    {
      element: document,
      type: 'click',
      handler: () => {
        doubleClickMenuState.visible = false;
      }
    }
  ]);

  //监听双击事件？
  eventManager.addEventListeners([
    {
      element: containerRef.value,
      type: 'dblclick',
      handler: eventHandlers.handleCanvasDoubleClick
    }
  ])

  //拖拽事件dragstart监听
  eventManager.addEventListeners([
    {
      element: containerRef.value,
      type: 'dragstart',
      handler: eventHandlers.onMouseDown
    },
    {
      element: containerRef.value,
      type: 'dragend',
      handler: eventHandlers.onMouseup
    },
    {
      element: containerRef.value,
      type: 'dragover',
      handler: eventHandlers.onMouseMove
    }
  ])


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

    rectInfoList.value.clear(); // 清空之前的记录

    for (const key of canvasRef.value.children) {
      const id = key.getAttribute('data-id') || '';
      const element = key as HTMLElement;

      // 直接从元素的 style 属性获取位置，这是画布坐标系中的位置
      const style = element.style;
      const x = parseFloat(style.left) || 0;
      const y = parseFloat(style.top) || 0;
      const width = parseFloat(style.width) || 0;
      const height = parseFloat(style.height) || 0;

      rectInfoList.value.set(id, {
        id,
        x,
        y,
        width,
        height,
      });
    }
    console.log('rectInfoList', rectInfoList.value);
  });
};

// 修改 computedIsSelected 函数
const computedIsSelected = (areaPoint: AreaPoint, rectInfo: RectInfo) => {
  const { startX, startY, endX, endY } = areaPoint;

  // 将屏幕坐标转换为画布坐标
  const canvasStartX = (startX - transformRef.value.x) / transformRef.value.scale;
  const canvasStartY = (startY - transformRef.value.y) / transformRef.value.scale;
  const canvasEndX = (endX - transformRef.value.x) / transformRef.value.scale;
  const canvasEndY = (endY - transformRef.value.y) / transformRef.value.scale;

  // 使用元素的原始画布坐标（不需要转换）
  const { x, y, width, height } = rectInfo;

  // 计算选择框的边界
  const selectionLeft = Math.min(canvasStartX, canvasEndX);
  const selectionTop = Math.min(canvasStartY, canvasEndY);
  const selectionRight = Math.max(canvasStartX, canvasEndX);
  const selectionBottom = Math.max(canvasStartY, canvasEndY);

  // 计算元素的边界
  const elementLeft = x;
  const elementTop = y;
  const elementRight = x + width;
  const elementBottom = y + height;

  // 检查元素是否在选择框内（任何重叠）
  return (
    elementLeft <= selectionRight &&
    elementRight >= selectionLeft &&
    elementTop <= selectionBottom &&
    elementBottom >= selectionTop
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

// 浮动菜单的操作
const ClickBoardMeun = (item: menuData) => {
  switch (item.action) {

  }

}



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
  overflow: hidden;
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
  z-index: 10;
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

.global-floating-menu {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  backdrop-filter: blur(8px);
}

.floating-menu-content {
  padding: 8px;
  min-width: 180px;
}

.menu-items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.menu-item:hover:not(.disabled) {
  background: #f3f4f6;
  transform: translateY(-1px);
}

.menu-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.menu-icon {
  font-size: 18px;
  margin-bottom: 6px;
  color: #6b7280;
}

.menu-label {
  font-size: 12px;
  color: #374151;
  text-align: center;
  line-height: 1.2;
}

/* 子菜单样式 */
.sub-menu-section {
  padding: 12px;
  min-width: 250px;
}

.shape-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.shape-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shape-item:hover {
  background: #f3f4f6;
}

.shape-item.active {
  background: #3b82f6;
  color: white;
}

.shape-preview {
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  border: 2px solid currentColor;
}

.shape-circle {
  border-radius: 50%;
}

.shape-Rect {
  border-radius: 4px;
}

.shape-Line {
  width: 24px;
  height: 2px;
  background: currentColor;
  margin: 15px 0;
}

.shape-Text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.shape-Curve {
  position: relative;
  overflow: hidden;
}

.shape-Curve::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transform: translateY(-50%);
}

.shape-label {
  font-size: 10px;
  text-align: center;
}

/* 控制组样式 */
.control-group {
  margin-bottom: 12px;
}

.control-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #374151;
}

.border-controls,
.text-controls {
  max-height: 300px;
  overflow-y: auto;
}

/* 页面悬停时显示浮动按钮 */
.page-item:hover .floating-trigger {
  opacity: 1 !important;
}
</style>
