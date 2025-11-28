<template>
  <!--      @mousedown="eventHandlers.onMouseDown($event, page)" -->
  <BoardMeun class="z-dialog" id="boardMenu" :visible="doubleClickMenuState.visible"
    :x="doubleClickMenuState.position.x" :y="doubleClickMenuState.position.y" @action="ClickBoardMeun" />
  <Toast position="top-center" />
  <div class="canvas-container" ref="containerRef" @contextmenu.prevent="showContextMenu"
    @mousedown="handleContainerMouseDown" @mousemove="handleContainerMouseMove" @mouseup="handleContainerMouseUp">
    <ContxtMenu ref="contextMenuRef" :menu-items="menuItems" class="z-dialog" />
    <TextEditOverlay v-model:visible="textEditState.visible" :position="textEditState.position"
      :text="textEditState.editingText" :font-size="textEditState.fontSize" :font-weight="textEditState.fontWeight"
      :color="textEditState.color" :font-style="textEditState.fontStyle" :text-decoration="textEditState.textDecoration"
      :width="textEditState.width" :height="textEditState.height" placeholder="请输入文本内容..."
      @confirm="handleTextEditConfirm" @cancel="handleTextEditCancel" />
    <div class="grid-bg" :style="gridStyle"></div>
    <div ref="canvasRef" class="canvas" :style="canvasStyle">
      <div v-for="(page, index) in pages" :key="index" :data-id="`id-key-${page.id}`" :id="`${page.id}`"
        class="absolute rounded-lg cursor-pointer select-none  duration-200 page-item overflow-visible" :style="{
          top: page.rect.y + 'px',
          left: page.rect.x + 'px',
          pointerEvents: 'auto',
          zIndex: 10,
          width: page.rect.width + 'px',
          height: page.rect.height + 'px',
          //旋转
          transform: `rotate(${page.rotate}deg)`,
          transformOrigin: 'center',
          padding: 10
        }" @click.stop="handlePageClick($event, page)">
        <BoardItem :width="page.rect.width" :height="page.rect.height" :cx="page.rect.width" :cy="page.rect.height"
          :boxshow="highRectList.has(`id-key-${page.id}`)" :id="page.id" @update:size="handleSizeUpdate"
          :scaleX="page.rect.scaleX" :scaleY="page.rect.scaleY" :color="page.background" :shape="page.type"
          :strokeColor="page.borderColor" :strokeWidth="page.borderWidth" :image="page.image || ''" :text="page.text"
          :textSize="page.textSize" :textWeight="page.textWeight" :filter="page.filter"
          @resize-start="handleResizeStart($event, page)" :BIUSArr="page.BIUSArr" />

        <!-- 浮动菜单触发按钮 -->
        <!-- 修改浮动按钮的事件绑定 -->
        <Button icon="pi pi-equals" severity="secondary" variant="text" raised rounded aria-label="Bookmark"
          class="floating-trigger" @click.stop="toggleFloatingMenu($event, page)"
          @mousedown.stop="handleRotateStart($event, page)" :pt="{
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
          }" />
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


          <!-- 图片设置 -->
          <div v-else-if="currentSubMenu === 'image'" class="sub-menu-section z-2">
            <div class="flex items-center justify-between mb-3 relative">
              <span class="text-sm font-medium">图片设置</span>
              <Button icon="pi pi-times" text rounded @click="currentSubMenu = null" />
            </div>

            <!-- 当前图片预览 -->
            <div v-if="currentPageImage" class="image-preview mb-4">
              <div class="preview-container border rounded p-2 bg-gray-50">
                <img :src="currentPageImage" :style="{ filter: getFilterStyle(currentPageFilter) }"
                  class="max-w-full h-20 object-contain mx-auto" alt="当前图片" />
              </div>
            </div>

            <div class="image-controls flex flex-col gap-3 mb-4">
              <!-- 上传图片按钮 -->
              <div class="upload-section">
                <label class="block text-xs font-medium mb-2 text-gray-700">上传新图片</label>
                <input type="file" ref="fileInputRef" accept="image/*" @change="handleImageUpload" class="hidden" />
                <Button label="选择图片" icon="pi pi-upload" size="small" @click="triggerFileInput" class="w-full" />
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-2 justify-between">
                <Button label="取消" severity="secondary" size="small" @click="currentSubMenu = null" class="flex-1" />
                <Button v-if="currentPageImage" label="删除图片" severity="danger" size="small" @click="deleteImage"
                  class="flex-1" />
              </div>
            </div>

            <!-- 更改滤镜 -->
            <div class="filter-controls z-bar relative">
              <label class="block text-xs font-medium mb-2 text-gray-700 z-bar">滤镜效果</label>
              <Select v-model="filter" :options="filters" optionLabel="name" optionValue="code" placeholder="选择滤镜"
                class="w-full" @update:modelValue="handleFilterChange" :index="10000" />
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

              <div class="card flex flex-wrap justify-center gap-4">
                <div class="flex items-center gap-2">
                  <Checkbox v-model="BIUS" inputId="ingredient1" name="pizza" value="Bold" />
                  <label for="ingredient1"> 加粗 </label>
                </div>
                <div class="flex items-center gap-2">
                  <Checkbox v-model="BIUS" inputId="ingredient2" name="pizza" value="Italic" />
                  <label for="ingredient2"> 斜体 </label>
                </div>
                <div class="flex items-center gap-2">
                  <Checkbox v-model="BIUS" inputId="ingredient3" name="pizza" value="Underline" />
                  <label for="ingredient3"> 下划线 </label>
                </div>
                <div class="flex items-center gap-2">
                  <Checkbox v-model="BIUS" inputId="ingredient4" name="pizza" value="Strikethrough" />
                  <label for="ingredient4"> 删除线 </label>
                </div>
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

    <BottomControlBar :transform="transformRef" :can-undo="canUndo" :can-redo="canRedo" @zoom-in="zoomIn"
      @zoom-out="zoomOut" @undo="handleUndo" @redo="handleRedo" @toggle-guides="toggleGuides" />

    <BoardLeft class="z-bar" id="boardLeft" />
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
import { ref, computed, onMounted, nextTick, reactive, type CSSProperties, watch } from 'vue';
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
import type { filter as Filter } from '~/types/components/type';
import TextEditOverlay from '~/components/Board/TextEditOverlay/TextEditOverlay.vue';
import BottomControlBar from '~/components/Board/BottomControlBar/BottomControlBar.vue';
import BoardMeunList from '~/server/BoardMeunList';
import { defineAsyncComponent } from 'vue';
import { onUnmounted } from 'vue';
import { availableShapes, fontWeightOptions } from '~/utils/data';
//交互管理
const interactionMode = ref<'select' | 'drag' | 'canvasDrag' | 'rotate' | 'resize'>('select');
const historyStore = useHistoryStore();
const ContxtMenu = defineAsyncComponent(() => import('~/components/Contextmenu/index.vue'))
type selectFilter = {
  name: string,
  code: Filter
}
// DOM 引用
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);
const targetIframe = ref<HTMLIFrameElement | null>(null);
const filter = ref();
const filters = ref<selectFilter[]>([
  { name: '模糊', code: 'blur' },
  { name: '灰度', code: 'grayscale' },
  { name: '反色', code: 'invert' },
  { name: '无色', code: 'none' },
])
//记录文字的形式
const BIUS = ref()
const BIUSArr = ref([])
const fileInputRef = ref<HTMLInputElement | null>(null);
// 状态管理
const transformRef = ref({ x: 0, y: 0, scale: 1 });
const pages = ref<WhithBoardProps[]>([
  { rect: { x: 0, y: 0, width: 200, height: 200 }, type: 'circle', background: '#e3f2fd', borderWidth: 2, borderColor: '#2196f3', id: 1, },
  { rect: { x: 500, y: 200, width: 200, height: 200 }, type: 'Rect', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 2 },
  { rect: { x: -300, y: 400, width: 200, height: 200 }, type: 'Line', background: '#e8f5e9', borderWidth: 2, borderColor: '#4caf50', id: 3 },
  { rect: { x: 1000, y: 400, width: 200, height: 200 }, type: 'Image', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 4, image: 'https://s2.loli.net/2025/11/15/fQ5bv8o2cxuC9da.jpg', filter: 'blur' },
  { rect: { x: 800, y: 800, width: 200, height: 200 }, type: 'Image', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 5, image: 'https://s2.loli.net/2025/11/15/fQ5bv8o2cxuC9da.jpg', filter: 'grayscale' },
  { rect: { x: 1000, y: 200, width: 200, height: 200 }, type: 'Image', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 6, image: 'https://s2.loli.net/2025/11/15/fQ5bv8o2cxuC9da.jpg', filter: 'invert' },
  { rect: { x: 500, y: 400, width: 200, height: 100 }, type: 'Text', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 7, text: 'Hello World', textSize: 36, BIUSArr: [] },
  { rect: { x: 800, y: 400, width: 200, height: 200 }, type: 'Rect', background: '#fff3e0', borderWidth: 2, borderColor: '#ff9800', id: 8, rotate: 45 },
]);
const WHITEBOARDPAGES = "whiteboard-pages"
const isGuide = ref(true);
const isMinimapVisible = ref(true);
const minimapZoom = ref(0.1);
const drawer = ref<Drawer>();
const rectInfoList = ref<Map<string, RectInfo>>(new Map());
const highRectList = ref<Set<string>>(new Set());
const contextMenuRef = ref()
// 吸附效果配置
const snapConfig = reactive({
  enabled: true, // 是否启用吸附
  distance: 10, // 吸附距离（像素）
  gridSize: 20, // 网格大小
  guides: {
    enabled: true, // 是否显示辅助线
    color: '#32cd79', // 辅助线颜色
    thickness: 1 // 辅助线粗细
  }
});

// 辅助线状态
const guideLines = reactive({
  horizontal: [] as number[], // 水平辅助线位置
  vertical: [] as number[], // 垂直辅助线位置
  visible: false // 是否显示
});

// 当前吸附到的位置
const currentSnapPoints = reactive({
  x: null as number | null,
  y: null as number | null
});

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
  },
  {
    key: 'snap-settings',
    icon: 'pi-magnet',
    label: snapConfig.enabled ? '关闭吸附' : '开启吸附',
    handler: () => {
      snapConfig.enabled = !snapConfig.enabled;
      toast.add({
        severity: 'info',
        summary: '吸附功能',
        detail: snapConfig.enabled ? '吸附已开启' : '吸附已关闭',
        life: 2000
      });
    }
  },
  {
    key: 'guide-settings',
    icon: 'pi-eye',
    label: snapConfig.guides.enabled ? '隐藏辅助线' : '显示辅助线',
    handler: () => {
      snapConfig.guides.enabled = !snapConfig.guides.enabled;
      toast.add({
        severity: 'info',
        summary: '辅助线',
        detail: snapConfig.guides.enabled ? '辅助线已显示' : '辅助线已隐藏',
        life: 2000
      });
    }
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


const showContextMenu = (e: MouseEvent) => {
  contextMenuRef.value?.show(e)
}
const dragState = reactive({
  isDragging: false,
  dragPageId: null as number | null,
  dragPageIds: [] as number[], // 新增：支持多个页面拖拽
  startX: 0,
  startY: 0,
  startPageX: 0,
  startPageY: 0,
  startPages: [] as { id: number, x: number, y: number }[], // 新增：多个页面的初始位置
  dragElement: null as HTMLElement | null,
});

//旋转的
const rotateState = reactive({
  isRotating: false,
  startX: 0,
  startY: 0,
  startAngle: 0,
  dragPageId: null as number | null,
  currentAngle: 0,
  centerX: 0,
  centerY: 0
})
// 交互状态
const interactionState = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  startTranslateX: 0,
  startTranslateY: 0,
  justFinishedSelecting: false,
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
  const target = event.target as HTMLElement;

  // 如果点击的不是浮动菜单或其内容，关闭菜单
  if (!target.closest('.global-floating-menu') &&
    !target.closest('.floating-trigger')) {
    closeFloatingMenu();
  }

  // 移除空白区域清除选择的逻辑，因为已经在 handleContainerMouseDown 中处理
  // 空白区域点击清除选择的功能由 handleContainerMouseDown 负责
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
          textWeight: textWeight.value,
          BIUSArr: Array.isArray(BIUS.value) ? BIUS.value : [] // 确保是数组
        };
      }
      return page;
    });

    saveAndNotify('文本', '文本设置已更新');
    currentSubMenu.value = null;
    BIUS.value = []; // 重置为数组
  }
};

// 保存并通知的通用方法
const saveAndNotify = (summary: string = '', detail: string = '') => {
  storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
  addHistory();

  if (detail) {
    toast.add({
      severity: 'success',
      summary,
      detail,
      life: 2000
    });
  }
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


const currentPageImage = computed(() => {
  if (currentPageId.value) {
    const page = pages.value.find(p => p.id === currentPageId.value);
    return page?.image || '';
  }
  return '';
});

const currentPageFilter = computed(() => {
  if (currentPageId.value) {
    const page = pages.value.find(p => p.id === currentPageId.value);
    return page?.filter || 'none';
  }
  return 'none';
});

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && currentPageId.value) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: '请选择图片文件',
        life: 3000
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;

      // 更新页面数据
      pages.value = pages.value.map(page => {
        if (page.id === currentPageId.value) {
          return {
            ...page,
            image: imageDataUrl,
            type: 'Image' // 确保类型设置为图片
          };
        }
        return page;
      });

      // 保存更改
      saveAndNotify('图片', '图片已上传');

      // 重置文件输入
      if (target) target.value = '';
    };

    reader.onerror = () => {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: '图片读取失败',
        life: 3000
      });
    };

    reader.readAsDataURL(file);
  }
};

// 修改删除图片函数
const deleteImage = () => {
  if (currentPageId.value) {
    pages.value = pages.value.map(page => {
      if (page.id === currentPageId.value) {
        return {
          ...page,
          image: '',
          filter: 'none'
        };
      }
      return page;
    });

    saveAndNotify('图片', '图片已删除');
    filter.value = 'none';
    currentSubMenu.value = null; // 关闭子菜单
  }
};

// 获取滤镜样式
const getFilterStyle = (filterType: string) => {
  switch (filterType) {
    case 'blur':
      return 'blur(2px)';
    case 'grayscale':
      return 'grayscale(100%)';
    case 'invert':
      return 'invert(100%)';
    default:
      return 'none';
  }
};

// 获取滤镜名称
const getFilterName = (filterCode: string) => {
  const filterObj = filters.value.find(f => f.code === filterCode);
  return filterObj ? filterObj.name : '无';
};

// 修改滤镜处理函数
// 修改 handleFilterChange 函数
const handleFilterChange = (newFilter: Filter) => {
  if (currentPageId.value) {
    pages.value = pages.value.map(page => {
      if (page.id === currentPageId.value) {
        return {
          ...page,
          filter: newFilter
        };
      }
      return page;
    });

    saveAndNotify('滤镜', `已应用${getFilterName(newFilter)}滤镜`);
  }
};
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

const clickPageItem = (e: MouseEvent, page?: WhithBoardProps) => {
  console.log('clickPageItem', page);
  e.stopPropagation();
  const target = e.currentTarget as HTMLElement;
  const id = target.getAttribute('data-id') || '';
  console.log('clickPageItem', id, target);

  // 如果有Ctrl键或Cmd键，支持多选
  if (e.ctrlKey || e.metaKey) {
    const newHighlights = new Set(highRectList.value);
    if (newHighlights.has(id)) {
      newHighlights.delete(id);
    } else {
      newHighlights.add(id);
    }
    highRectList.value = newHighlights;
    console.log(highRectList.value, "clicPageItem")
  } else {
    // 没有Ctrl键，单选
    const newHighlights = new Set([id]);
    if (JSON.stringify([...newHighlights]) !== JSON.stringify([...highRectList.value])) {
      highRectList.value = newHighlights;
      console.log(highRectList.value, "clicPageItem")
    }
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
      currentSubMenu.value = 'image';
    }
  },

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

// --- 拖拽状态管理 (父组件) ---
const isResizing = ref(false);
const resizeState = ref({
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
  startLeft: 0,
  startTop: 0,
  direction: '', // 'nw-resize', 'se-resize' 等
  activePageId: null as number | null
});

// 处理子组件传来的开始缩放事件
const handleResizeStart = (payload: { event: MouseEvent; direction: string; id: number }, page: any) => {
  // 阻止冒泡，避免触发画布移动等其他逻辑
  // payload.event.stopPropagation(); // 根据需要开启

  isResizing.value = true;
  resizeState.value = {
    startX: payload.event.clientX,
    startY: payload.event.clientY,
    startWidth: page.rect.width,
    startHeight: page.rect.height,
    startLeft: page.rect.x,
    startTop: page.rect.y,
    direction: payload.direction,
    activePageId: page.id
  };
  document.body.style.cursor = getCursorStyle(payload.direction);
};

const getCursorStyle = (dir: string) => {
  switch (dir) {
    case 'nw-resize': case 'se-resize': return 'nwse-resize';
    case 'ne-resize': case 'sw-resize': return 'nesw-resize';
    case 'n-resize': case 's-resize': return 'ns-resize';
    case 'e-resize': case 'w-resize': return 'ew-resize';
    default: return 'default';
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isResizing.value || !resizeState.value.activePageId) return;

  // 如果你有画布缩放 (transformRef.scale)，这里记得除以缩放比例
  // const scale = transformRef.value.scale || 1; 
  const scale = 1; // 暂时假设为 1，如果有缩放功能请替换上面那行

  const dx = (event.clientX - resizeState.value.startX) / scale;
  const dy = (event.clientY - resizeState.value.startY) / scale;

  const page = pages.value.find(p => p.id === resizeState.value.activePageId);
  if (!page) return;

  const { startWidth, startHeight, startLeft, startTop, direction } = resizeState.value;
  const MIN_SIZE = 20; // 最小限制

  let newWidth, newHeight;

  switch (direction) {
    // --- 简单方向：只改宽高，不改位置 (右、下、右下) ---
    case 'e-resize': // 右
      page.rect.width = Math.max(MIN_SIZE, startWidth + dx);
      break;

    case 's-resize': // 下
      page.rect.height = Math.max(MIN_SIZE, startHeight + dy);
      break;

    case 'se-resize': // 右下
      page.rect.width = Math.max(MIN_SIZE, startWidth + dx);
      page.rect.height = Math.max(MIN_SIZE, startHeight + dy);
      break;

    // --- 复杂方向：改宽高的同时，必须反向补偿位置 (左、上) ---
    // 逻辑：新的位置 = 原位置 + (原宽 - 新宽)
    // 这样只有当宽度真的发生变化时，位置才会变，不会出现卡在最小宽度位置乱飘的情况

    case 'w-resize': // 左
      newWidth = Math.max(MIN_SIZE, startWidth - dx);
      page.rect.width = newWidth;
      page.rect.x = startLeft + (startWidth - newWidth);
      break;

    case 'n-resize': // 上
      newHeight = Math.max(MIN_SIZE, startHeight - dy);
      page.rect.height = newHeight;
      page.rect.y = startTop + (startHeight - newHeight);
      break;

    // --- 组合方向 (右上、左上、左下) ---

    case 'ne-resize': // 右上 (宽变大，高变大且Y上移)
      page.rect.width = Math.max(MIN_SIZE, startWidth + dx); // 宽同 e-resize

      newHeight = Math.max(MIN_SIZE, startHeight - dy);
      page.rect.height = newHeight;
      page.rect.y = startTop + (startHeight - newHeight); // Y同 n-resize
      break;

    case 'nw-resize': // 左上 (最复杂：XYWH都变)
      newWidth = Math.max(MIN_SIZE, startWidth - dx);
      page.rect.width = newWidth;
      page.rect.x = startLeft + (startWidth - newWidth); // X同 w-resize

      newHeight = Math.max(MIN_SIZE, startHeight - dy);
      page.rect.height = newHeight;
      page.rect.y = startTop + (startHeight - newHeight); // Y同 n-resize
      break;

    case 'sw-resize': // 左下 (宽变大且X左移，高变大)
      newWidth = Math.max(MIN_SIZE, startWidth - dx);
      page.rect.width = newWidth;
      page.rect.x = startLeft + (startWidth - newWidth); // X同 w-resize

      page.rect.height = Math.max(MIN_SIZE, startHeight + dy); // 高同 s-resize
      break;
  }
};

const handleMouseUp = () => {
  if (isResizing.value) {
    isResizing.value = false;
    resizeState.value.activePageId = null;
    // 这里可以保存历史记录 (Undo/Redo)
  }
};

// 事件处理函数
const eventHandlers = {
  // 画布拖拽
  handleCanvasDragStart(e: MouseEvent) {
    if (e.button !== 0) return;
    if (!keyboardState.isSpacePressed) return;

    interactionMode.value = 'canvasDrag';
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
    if (highRectList.value.size > 0) return
    doubleClickMenuState.visible = !doubleClickMenuState.visible;
    doubleClickMenuState.position = { x: e.clientX, y: e.clientY };
  },
};


const handleContainerMouseDown = (event: MouseEvent) => {
  // 检查是否点击在页面元素上
  const target = event.target as HTMLElement;
  const pageElement = target.closest('.page-item') as HTMLElement;

  // 如果点击在页面元素上，开始元素拖拽
  if (pageElement && !target.closest('.floating-trigger')) {
    startElementDrag(event, pageElement);
    console.log('startElementDrag');
  } else {
    // 只有在没有选中任何元素时才开始框选
    // 如果已经有选中元素，点击空白区域应该清除选择
    if (highRectList.value.size === 0) {
      console.log('clearSelection', highRectList.value);
      startSelection(event);
    } else {
      console.log('clearSelection111111111111');
      // 如果有选中元素，点击空白区域立即清除选择
      highRectList.value.clear();
      //阻止后面的事件
      event.stopPropagation();
      console.log('clearSelection111111111111', highRectList.value);
    }
  }
};

const handleContainerMouseMove = (event: MouseEvent) => {
  switch (interactionMode.value) {
    case 'drag':
      handleElementDragMove(event);
      break;
    case 'select':
      handleSelectionMove(event);
      break;
    case 'canvasDrag':
      eventHandlers.handleCanvasDrag(event);
      break;
    // 其他模式...
  }
};

const handleContainerMouseUp = (event: MouseEvent) => {
  console.log('handleContainerMouseUp', interactionMode.value);
  switch (interactionMode.value) {
    case 'drag':
      handleElementDragEnd(event);
      break;
    case 'select':
      handleSelectionEnd(event);
      break;
    case 'canvasDrag':
      eventHandlers.handleCanvasDragEnd();
      break;
  }
  interactionMode.value = 'select'; // 重置为选择模式
};

// 元素拖拽相关函数
const startElementDrag = (event: MouseEvent, pageElement: HTMLElement) => {
  interactionMode.value = 'drag';

  // 获取点击的页面ID
  const clickedPageId = pageElement.id ? parseInt(pageElement.id, 10) : null;
  if (!clickedPageId) {
    interactionMode.value = 'select';
    return;
  }

  const elementId = `id-key-${clickedPageId}`;

  // 如果当前点击的元素没有被高亮，先清除其他高亮并高亮当前元素
  if (!highRectList.value.has(elementId)) {
    highRectList.value.clear();
    highRectList.value.add(elementId);
    console.log(highRectList.value, 'startElementDrag')
  }

  // 判断是否多选拖拽
  if (highRectList.value.size > 1) {
    // 多选拖拽：拖拽所有高亮元素
    dragState.dragPageIds = Array.from(highRectList.value)
      .map(id => {
        const match = id.match(/id-key-(\d+)/);
        return match ? parseInt(match[1]!, 10) : null;
      })
      .filter(id => id !== null) as number[];

    // 记录所有选中页面的初始位置
    dragState.startPages = dragState.dragPageIds.map(id => {
      const page = pages.value.find(p => p.id === id);
      return page ? { id, x: page.rect.x, y: page.rect.y } : null;
    }).filter(Boolean) as { id: number, x: number, y: number }[];

  } else {
    // 单选拖拽
    dragState.dragPageId = clickedPageId;
    dragState.dragPageIds = [clickedPageId];

    const page = pages.value.find((page) => page.id === clickedPageId);
    if (!page) {
      interactionMode.value = 'select';
      return;
    }

    dragState.startPages = [{ id: clickedPageId, x: page.rect.x, y: page.rect.y }];
  }

  // 记录初始状态
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.dragElement = pageElement;

  drawer.value?.clear();
};

const handleElementDragMove = (event: MouseEvent) => {
  if (dragState.dragPageIds.length === 0) return;

  // 计算位移（考虑画布缩放）
  const deltaX = (event.clientX - dragState.startX) / transformRef.value.scale;
  const deltaY = (event.clientY - dragState.startY) / transformRef.value.scale;

  // 获取主元素（第一个拖拽的元素）
  const mainPageId = dragState.dragPageIds[0];
  const startPage = dragState.startPages[0];
  if (!startPage) return;

  let newX = startPage.x + deltaX;
  let newY = startPage.y + deltaY;

  // 应用吸附效果
  if (snapConfig.enabled) {
    // 从 pages 数据中获取实际的宽度和高度
    const mainPage = pages.value.find(page => page.id === mainPageId);
    if (mainPage) {
      const currentRect = {
        x: newX,
        y: newY,
        width: mainPage.rect.width,
        height: mainPage.rect.height
      };

      const snapPoints = calculateSnapPoints(currentRect);
      const snapResult = checkSnap(newX, newY, snapPoints);
      
      newX = snapResult.x;
      newY = snapResult.y;
      
      // 更新辅助线
      if (snapConfig.guides.enabled) {
        updateGuideLines(snapResult.horizontalGuide, snapResult.verticalGuide);
        drawGuideLines();
      }

      // 更新当前吸附位置（可用于显示吸附提示）
      currentSnapPoints.x = snapResult.horizontalGuide;
      currentSnapPoints.y = snapResult.verticalGuide;
    }
  }

  // 实时更新所有选中元素的位置
  dragState.dragPageIds.forEach((pageId, index) => {
    const startPage = dragState.startPages[index];
    if (!startPage) return;

    // 计算相对位移（对于多选拖拽）
    const relativeDeltaX = newX - dragState.startPages[0]!.x;
    const relativeDeltaY = newY - dragState.startPages[0]!.y;

    const elementX = startPage.x + relativeDeltaX;
    const elementY = startPage.y + relativeDeltaY;

    // 更新DOM元素位置
    const element = document.getElementById(`${pageId}`);
    if (element) {
      element.style.left = `${elementX}px`;
      element.style.top = `${elementY}px`;
    }
  });

  // 强制更新高亮状态
  const newHighlights = new Set(dragState.dragPageIds.map(id => `id-key-${id}`));
  if (JSON.stringify([...newHighlights]) !== JSON.stringify([...highRectList.value])) {
    highRectList.value = newHighlights;
  }
};

const handleElementDragEnd = (event: MouseEvent) => {
  if (dragState.dragPageIds.length === 0) return;

  // 计算最终位移（考虑画布缩放）
  const deltaX = (event.clientX - dragState.startX) / transformRef.value.scale;
  const deltaY = (event.clientY - dragState.startY) / transformRef.value.scale;

  // 清除辅助线
  guideLines.visible = false;
  guideLines.horizontal = [];
  guideLines.vertical = [];
  if (drawer.value) {
    drawer.value.clearGuideLines();
  }
  currentSnapPoints.x = null;
  currentSnapPoints.y = null;

  // 最终更新所有页面数据
  pages.value = pages.value.map(page => {
    const startPageIndex = dragState.startPages.findIndex(sp => sp.id === page.id);
    if (startPageIndex !== -1) {
      const startPage = dragState.startPages[startPageIndex];
      return {
        ...page,
        rect: {
          ...page.rect,
          x: startPage!.x + deltaX,
          y: startPage!.y + deltaY
        }
      };
    }
    return page;
  });

  // 确保高亮状态正确
  highRectList.value = new Set(dragState.dragPageIds.map(id => `id-key-${id}`));

  // 重置拖拽状态
  dragState.dragPageId = null;
  dragState.dragPageIds = [];
  dragState.startPages = [];
  dragState.dragElement = null;

  // 保存数据
  storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
  addHistory();
  getAllDomPoint();
};


const handleSelectionEnd = (event: MouseEvent) => {
  if (keyboardState.isSpacePressed) return
  interactionState.isSelecting = false;
  drawer.value?.clear();
};
// 框选相关函数
const startSelection = (event: MouseEvent) => {
  if (interactionMode.value !== 'select') return;
  if (keyboardState.isSpacePressed) return
  doubleClickMenuState.visible = false;

  interactionState.isSelecting = true;
  const { clientX, clientY } = event;
  interactionState.areaPoint.startX = clientX;
  interactionState.areaPoint.startY = clientY;
  interactionState.areaPoint.endX = clientX; // 初始化结束点
  interactionState.areaPoint.endY = clientY;
};

const handleSelectionMove = (event: MouseEvent) => {
  if (!interactionState.isSelecting) return;
  if (keyboardState.isSpacePressed) return

  const { clientX, clientY } = event;
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
};


// 旋转开始处理
const handleRotateStart = (e: MouseEvent, page: any) => {
  e.stopPropagation()
  e.preventDefault()

  // 确保旋转的元素被高亮
  const elementId = `id-key-${page.id}`;
  if (!highRectList.value.has(elementId)) {
    highRectList.value.clear();
    highRectList.value.add(elementId);
  }

  //更改鼠标值
  document.body.style.cursor = 'alias'

  const target = e.currentTarget as Element;
  const pageElement = target instanceof HTMLElement ? target.closest('.page-item') as HTMLElement : null;
  if (!pageElement) return

  rotateState.isRotating = true
  rotateState.dragPageId = page.id
  rotateState.startAngle = page.rotate || 0

  // 计算元素中心点（相对于视口）
  const rect = pageElement.getBoundingClientRect()
  rotateState.centerX = rect.left + rect.width / 2
  rotateState.centerY = rect.top + rect.height / 2

  // 记录初始角度
  rotateState.startX = e.clientX
  rotateState.startY = e.clientY

  // 阻止文本选择
  document.body.style.userSelect = 'none'
}

// 旋转移动处理
const handleRotateMove = (e: MouseEvent) => {
  if (!rotateState.isRotating || rotateState.dragPageId === null) return

  e.preventDefault()

  // 计算角度变化
  const startAngle = Math.atan2(
    rotateState.startY - rotateState.centerY,
    rotateState.startX - rotateState.centerX
  )

  const currentAngle = Math.atan2(
    e.clientY - rotateState.centerY,
    e.clientX - rotateState.centerX
  )

  // 计算角度差（弧度转角度）
  let angleDiff = (currentAngle - startAngle) * (180 / Math.PI)

  // 平滑角度变化，避免跳跃
  if (angleDiff > 180) angleDiff -= 360
  if (angleDiff < -180) angleDiff += 360

  // 更新角度
  rotateState.currentAngle = rotateState.startAngle + angleDiff

  // 更新页面数据
  const pageIndex = pages.value.findIndex(p => p.id === rotateState.dragPageId)
  if (pageIndex !== -1) {
    pages.value[pageIndex]!.rotate = Math.round(rotateState.currentAngle)
  }
}

// 旋转结束处理
// 修改 handleRotateEnd 函数
const handleRotateEnd = () => {
  if (!rotateState.isRotating) return;

  rotateState.isRotating = false;
  rotateState.dragPageId = null;

  // 恢复样式
  document.body.style.cursor = 'default';
  document.body.style.userSelect = '';

  // 保存状态
  saveAndNotify('旋转', '旋转角度已更新');
}

// 初始化事件管理器
const eventManager = useEventManager();

// 初始化所有事件
const initializeEvents = () => {
  if (!containerRef.value) return;
  if (!canvasRef.value) return

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
    },
    {
      element: canvasRef.value,
      type: 'dblclick',
      handler: handleCanvasDoubleClick
    }
  ])

  // 处理子组件传来的开始缩放事件
  eventManager.addEventListeners([
    {
      element: window,
      type: 'mousemove',
      handler: handleMouseMove
    },
    {
      element: window,
      type: 'mouseup',
      handler: handleMouseUp
    }
  ])

  // 旋转
  eventManager.addEventListeners([
    {
      element: document,
      type: 'mousemove',
      handler: handleRotateMove
    },
    {
      element: document,
      type: 'mouseup',
      handler: handleRotateEnd
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
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '5'; // 确保在正确层级
  canvas.style.pointerEvents = 'none'; // 不拦截鼠标事件
  
  drawer.value = new Drawer({ view: canvas });
  console.log('Canvas initialized:', drawer.value);
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
const ClickBoardMeun = (item: menuData, x: number, y: number) => {
  console.log("点击了菜单项:", item, x, y);
  //拿到鼠标的位置
  let mode
  switch (item.action) {
    case "Rect":
      mode = BoardMeunList.addRect(x, y)
      break
    case "Circle":
      mode = BoardMeunList.addCircle(x, y)
      break
    case "Line":
      mode = BoardMeunList.addLine(x, y)
      break
    case "Text":
      mode = BoardMeunList.addText(x, y)
      break
    case "Image":
      mode = BoardMeunList.addImage(x, y)
      break
    case "Triangle":
      mode = BoardMeunList.addTriangle(x, y)
      break
    case "insertArrow":
      mode = BoardMeunList.addInsertArrow(x, y)
      break
    case "insertStar":
      mode = BoardMeunList.addInsertStar(x, y)
      break
    case "insertHeart":
      mode = BoardMeunList.addInsertHeart(x, y)
      break
  }
  if (mode) {
    pages.value.push(mode)
    //提示和保存
    saveAndNotify()
    doubleClickMenuState.visible = false
  }
}




//文字处理
const textEditState = reactive({
  visible: false,
  editingPageId: null as number | null,
  editingText: '',
  position: { x: 0, y: 0 },
  fontSize: 16,
  fontWeight: 'normal',
  color: '#000000',
  fontStyle: 'normal' as 'normal' | 'italic',
  textDecoration: 'none' as 'none' | 'underline' | 'line-through',
  width: 300,
  height: 150
});

// 修改双击事件处理
const handleCanvasDoubleClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  // 检查是否双击在文字元素上
  const pageElement = target.closest('.page-item') as HTMLElement;
  if (pageElement) {
    const pageId = pageElement.id ? parseInt(pageElement.id, 10) : null;
    if (pageId) {
      const page = pages.value.find(p => p.id === pageId);
      if (page && page.type === 'Text') {
        startTextEdit(e, page);
        return; // 如果是文字编辑，不显示双击菜单
      }
    }
  }

  // 原有的双击菜单逻辑
  if (interactionState.isDragging) return;
  if (interactionState.isSelecting) return;
  if (highRectList.value.size > 0) return;

  doubleClickMenuState.visible = !doubleClickMenuState.visible;
  doubleClickMenuState.position = { x: e.clientX, y: e.clientY };
};

// 开始文字编辑
const startTextEdit = (event: MouseEvent, page: WhithBoardProps) => {
  event.stopPropagation();

  // 设置编辑状态
  textEditState.editingPageId = page.id;
  textEditState.editingText = page.text || '';
  textEditState.fontSize = page.textSize || 16;
  textEditState.fontWeight = page.textWeight || 'normal';
  textEditState.color = page.background || '#000000';

  // 设置文字样式
  if (page.BIUSArr) {
    textEditState.fontStyle = page.BIUSArr.includes('Italic') ? 'italic' : 'normal';
    if (page.BIUSArr.includes('Underline')) {
      textEditState.textDecoration = 'underline';
    } else if (page.BIUSArr.includes('Strikethrough')) {
      textEditState.textDecoration = 'line-through';
    } else {
      textEditState.textDecoration = 'none';
    }
  }

  // 计算编辑框位置
  const pageElement = document.getElementById(`${page.id}`);
  if (pageElement) {
    const rect = pageElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 计算最佳位置，避免超出视口
    let x = rect.left + window.scrollX;
    let y = rect.top + window.scrollY;

    // 如果右侧空间不足，显示在左侧
    if (x + textEditState.width > viewportWidth - 20) {
      x = Math.max(20, viewportWidth - textEditState.width - 20);
    }

    // 如果底部空间不足，显示在上方
    if (y + textEditState.height > viewportHeight - 20) {
      y = Math.max(20, viewportHeight - textEditState.height - 20);
    }

    textEditState.position = { x, y };
  } else {
    // 备用位置：鼠标位置
    textEditState.position = {
      x: event.clientX,
      y: event.clientY
    };
  }

  // 调整编辑框尺寸基于文字内容
  const textLength = page.text?.length || 0;
  if (textLength > 50) {
    textEditState.width = 400;
    textEditState.height = 200;
  } else if (textLength > 20) {
    textEditState.width = 350;
    textEditState.height = 180;
  }

  textEditState.visible = true;
};

// 处理文字编辑确认
const handleTextEditConfirm = (newText: string) => {
  if (!textEditState.editingPageId) return;

  const finalText = newText.trim() || '请输入文本';

  // 更新页面数据
  pages.value = pages.value.map(page => {
    if (page.id === textEditState.editingPageId) {
      return {
        ...page,
        text: finalText
      };
    }
    return page;
  });

  // 保存数据
  storageIndexDB.saveData(pages.value, WHITEBOARDPAGES);
  addHistory();

  // 显示成功提示
  toast.add({
    severity: 'success',
    summary: '文本更新',
    detail: '文本内容已更新',
    life: 2000
  });

  resetTextEditState();
};

// 处理文字编辑取消
const handleTextEditCancel = () => {
  resetTextEditState();
};

// 重置文字编辑状态
const resetTextEditState = () => {
  textEditState.visible = false;
  textEditState.editingPageId = null;
  textEditState.editingText = '';
  textEditState.position = { x: 0, y: 0 };
  textEditState.width = 300;
  textEditState.height = 150;
};


//吸附判断
// 计算吸附点
// 计算吸附点
const calculateSnapPoints = (currentRect: { x: number, y: number, width: number, height: number }) => {
  const snapPoints = {
    horizontal: [] as number[],
    vertical: [] as number[]
  };

  if (!snapConfig.enabled) return snapPoints;

  // 网格吸附点
  const gridStartX = Math.floor(currentRect.x / snapConfig.gridSize) * snapConfig.gridSize;
  const gridStartY = Math.floor(currentRect.y / snapConfig.gridSize) * snapConfig.gridSize;
  
  // 添加更多网格点
  for (let i = -5; i <= 5; i++) {
    snapPoints.horizontal.push(gridStartX + i * snapConfig.gridSize);
    snapPoints.vertical.push(gridStartY + i * snapConfig.gridSize);
  }

  // 当前元素的边缘和中心点（用于与其他元素对齐）
  const currentElementPoints = {
    left: currentRect.x,
    centerX: currentRect.x + currentRect.width / 2,
    right: currentRect.x + currentRect.width,
    top: currentRect.y,
    centerY: currentRect.y + currentRect.height / 2,
    bottom: currentRect.y + currentRect.height
  };

  // 其他元素边缘吸附点
  pages.value.forEach(page => {
    if (dragState.dragPageIds.includes(page.id)) return; // 跳过当前拖拽的元素
    
    const rect = page.rect;
    
    // 左边缘、中心、右边缘
    snapPoints.horizontal.push(rect.x);
    snapPoints.horizontal.push(rect.x + rect.width / 2);
    snapPoints.horizontal.push(rect.x + rect.width);
    
    // 上边缘、中心、下边缘
    snapPoints.vertical.push(rect.y);
    snapPoints.vertical.push(rect.y + rect.height / 2);
    snapPoints.vertical.push(rect.y + rect.height);

    // 添加当前元素与其他元素对齐的点
    // 水平对齐：左对左、中对中、右对右
    snapPoints.horizontal.push(rect.x - currentElementPoints.left + currentRect.x);
    snapPoints.horizontal.push(rect.x + rect.width / 2 - currentElementPoints.centerX + currentRect.x);
    snapPoints.horizontal.push(rect.x + rect.width - currentElementPoints.right + currentRect.x);
    
    // 垂直对齐：上对上、中对中、下对下
    snapPoints.vertical.push(rect.y - currentElementPoints.top + currentRect.y);
    snapPoints.vertical.push(rect.y + rect.height / 2 - currentElementPoints.centerY + currentRect.y);
    snapPoints.vertical.push(rect.y + rect.height - currentElementPoints.bottom + currentRect.y);
  });

  return snapPoints;
};
const checkSnap = (currentX: number, currentY: number, snapPoints: { horizontal: number[], vertical: number[] }) => {
  let snappedX = currentX;
  let snappedY = currentY;
  let horizontalGuide: number | null = null;
  let verticalGuide: number | null = null;

  // 水平方向吸附检测
  let minHorizontalDistance = snapConfig.distance;
  for (const point of snapPoints.horizontal) {
    const distance = Math.abs(currentX - point);
    if (distance < minHorizontalDistance) {
      minHorizontalDistance = distance;
      snappedX = point;
      horizontalGuide = point;
    }
  }

  // 垂直方向吸附检测
  let minVerticalDistance = snapConfig.distance;
  for (const point of snapPoints.vertical) {
    const distance = Math.abs(currentY - point);
    if (distance < minVerticalDistance) {
      minVerticalDistance = distance;
      snappedY = point;
      verticalGuide = point;
    }
  }

  return {
    x: snappedX,
    y: snappedY,
    horizontalGuide,
    verticalGuide
  };
};

// 更新辅助线显示
const updateGuideLines = (horizontal: number | null, vertical: number | null) => {
  guideLines.horizontal = horizontal !== null ? [horizontal] : [];
  guideLines.vertical = vertical !== null ? [vertical] : [];
  guideLines.visible = horizontal !== null || vertical !== null;
};

// 绘制辅助线
// 绘制辅助线
const drawGuideLines = () => {
  if (!drawer.value || !guideLines.visible) return;

  // 清除之前的辅助线
  drawer.value.clearGuideLines();

  // 绘制水平辅助线
  guideLines.horizontal.forEach(y => {
    const line = new Rectutils(
      {
        x: -10000, // 足够长的线
        y: y,
        width: 20000,
        height: snapConfig.guides.thickness,
        isFill: true,
        color: snapConfig.guides.color
      },
      'guide-line'
    );
    drawer.value?.addGuideLine(line);
  });

  // 绘制垂直辅助线
  guideLines.vertical.forEach(x => {
    const line = new Rectutils(
      {
        x: x,
        y: -10000, // 足够长的线
        width: snapConfig.guides.thickness,
        height: 20000,
        isFill: true,
        color: snapConfig.guides.color
      },
      'guide-line'
    );
    drawer.value?.addGuideLine(line);
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

/* 图片预览样式 */
.image-preview .preview-container {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-section {
  border: 2px dashed #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  transition: border-color 0.3s ease;
}

.upload-section:hover {
  border-color: #3b82f6;
}

.filter-preview {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #3b82f6;
}

.snap-indicator {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.snap-info {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  gap: 12px;
}
</style>
