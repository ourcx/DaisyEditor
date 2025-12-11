<template>
  <div ref="shapeContainer" class="shape-container" draggable="false"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { select, type Selection } from "d3-selection";
import { curveBasis, line } from "d3-shape";
import { pointer } from "d3-selection";
import type { BIUS, filter, ShapesProps } from "~/types/components/type";

definePageMeta({
  layout: false,
});

const emit = defineEmits<{
  "resize-start": [payload: { event: MouseEvent; direction: string; id: number }];
  "path-drawn": [path: string, id: number];
  "connect-start": [payload: { event: MouseEvent; direction: string; id: number }];
  "connect-end": [payload: { id: number }];
}>();

const props = withDefaults(defineProps<ShapesProps>(), {
  width: 200,
  height: 200,
  shape: "circle",
  data: () => [],
  type: "primary",
  text: "",
  textAlign: "center",
  textColor: "#333",
  textSize: 16,
  textWeight: 600,
  color: "#bcecd4",
  boxshow: true,
  id: 0,
  scaleX: 1,
  scaleY: 1,
  strokeColor: "#2d5a3d",
  strokeWidth: 2,
  image: "",
  filter: "none",
  BIUSArr: () => [],
  path: '',
});

const ID = `${props.id}-svg`;
const shapeContainer = ref<HTMLElement | null>(null);

// D3 Selection 引用缓存
let currentSvg: Selection<SVGSVGElement, unknown, null, undefined> | null = null;
let currentShape: Selection<any, unknown, null, undefined> | null = null;
let selectionGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
let currentPathGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
let brushArea: Selection<SVGRectElement, unknown, null, undefined> | null = null;

// 状态追踪
let renderedShapeType: string = ""; // 记录当前渲染的形状类型，用于 diff
let cachedImageElement: Selection<SVGImageElement, unknown, null, undefined> | null = null;
const imageCache = new Map<string, HTMLImageElement>();

// 画笔相关变量
let isBrushDrawing: boolean = false;
let currentPath: Selection<SVGPathElement, unknown, null, undefined> | null = null;
let currentPathData: string = '';

const biusMap: Record<BIUS, () => void> = {
  Bold: () => currentShape?.style("font-weight", "bold"), // 修正：bold 数值可能需要根据需求调整
  Italic: () => currentShape?.style("font-style", "italic"),
  Underline: () => currentShape?.style("text-decoration", "underline"),
  Strikethrough: () => currentShape?.style("text-decoration", "line-through")
};

// --- 资源加载 ---
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (imageCache.has(src)) {
      resolve(imageCache.get(src)!);
      return;
    }
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
};

// --- 滤镜管理 (按需创建) ---
const ensureFilterDefinitions = () => {
  if (!currentSvg) return;
  // 检查 defs 是否存在，不存在则创建
  let defs = currentSvg.select("defs");
  if (defs.empty()) {
    defs = currentSvg.append("defs") as any;
  }

  // 检查是否已经创建过该 ID 的滤镜，避免重复 DOM 操作
  if (!defs.select(`#blur-filter-${props.id}`).empty()) return;

  // 1. 模糊
  const blurFilter = defs.append("filter")
    .attr("id", `blur-filter-${props.id}`)
    .attr("class", `filter-${props.id}`)
    .attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
  blurFilter.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", 5);

  // 2. 灰度
  const grayscaleFilter = defs.append("filter")
    .attr("id", `grayscale-filter-${props.id}`)
    .attr("class", `filter-${props.id}`);
  grayscaleFilter.append("feColorMatrix")
    .attr("type", "matrix")
    .attr("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0");

  // 3. 反转
  const invertFilter = defs.append("filter")
    .attr("id", `invert-filter-${props.id}`)
    .attr("class", `filter-${props.id}`);
  const transfer = invertFilter.append("feComponentTransfer");
  transfer.append("feFuncR").attr("type", "table").attr("tableValues", "1 0");
  transfer.append("feFuncG").attr("type", "table").attr("tableValues", "1 0");
  transfer.append("feFuncB").attr("type", "table").attr("tableValues", "1 0");

  // 4. 阴影
  const shadowFilter = defs.append("filter")
    .attr("id", `colored-shadow-${props.id}`)
    .attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
  shadowFilter.append("feDropShadow")
    .attr("stdDeviation", 8)
    .attr("flood-color", props.color || "#bcecd4")
    .attr("flood-opacity", 1)
    .attr("class", "shadow-element"); // 标记以便更新颜色
};

const getFilterUrl = (filterType: filter): string | null => {
  if (!filterType || filterType === 'none') return null;
  return `url(#${filterType}-filter-${props.id})`;
};

// --- 核心优化：SVG 容器与 DOM 结构管理 ---
const ensureSvgContainer = () => {
  if (!shapeContainer.value) return false;
  
  if (!currentSvg) {
    currentSvg = select(shapeContainer.value)
      .append("svg")
      .attr("class", ID)
      .style("overflow", "visible")
      .style("display", "block") as any;
  }
  
  // 总是更新 ViewBox 以响应大小变化，不需要重绘 DOM
  currentSvg!
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${props.width} ${props.height}`)
    .attr("preserveAspectRatio", "none");

  if (props.scaleX !== 1 || props.scaleY !== 1) {
    currentSvg!.style("transform", `scale(${props.scaleX}, ${props.scaleY})`);
    currentSvg!.style("transform-origin", "0 0");
  } else {
    currentSvg!.style("transform", null);
  }

  ensureFilterDefinitions();
  return true;
};

// --- 核心优化：形状 DOM 创建与 Diff ---
const createShapeDOM = async () => {
  if (!currentSvg) return;

  // 如果形状类型没变且 currentShape 存在，则跳过创建，直接进入更新阶段
  if (props.shape === renderedShapeType && currentShape) {
    return;
  }

  // 1. 清理旧形状
  if (currentShape) currentShape.remove();
  if (currentPathGroup) currentPathGroup.remove();
  if (brushArea) brushArea.remove();
  cachedImageElement = null;
  renderedShapeType = props.shape; // 更新当前类型

  // 2. 创建新形状 DOM (只负责 append，不负责设置具体坐标属性，坐标由 updateAttributes 负责)
  switch (props.shape) {
    case "circle":
      currentShape = currentSvg.append("circle");
      break;
    case "Rect":
      currentShape = currentSvg.append("rect");
      break;
    case "Line":
      currentShape = currentSvg.append("line");
      break;
    case "Text":
      currentShape = currentSvg.append("text").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
      break;
    case "Curve":
      currentShape = currentSvg.append("path");
      break;
    case "Triangle":
    case "insertStar":
      currentShape = currentSvg.append("polygon");
      break;
    case "insertHeart":
      currentShape = currentSvg.append("path");
      break;
    case "insertArrow":
      // Arrow 需要 marker，检查 marker 是否存在
      const defs = currentSvg.select("defs");
      if (defs.select(`#arrow-${props.id}`).empty()) {
         defs.append("marker")
          .attr("id", `arrow-${props.id}`)
          .attr("markerUnits", "strokeWidth")
          .attr("markerWidth", 12).attr("markerHeight", 12)
          .attr("orient", "auto")
          .attr("viewBox", "0 -5 10 10")
          .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", props.color);
      }
      currentShape = currentSvg.append("line");
      break;
    case "Image":
      currentShape = currentSvg.append("image").attr("preserveAspectRatio", "none");
      cachedImageElement = currentShape as any;
      break;
    case "Free":
      initBrushGroup();
      currentShape = brushArea;
      break;
    default:
      currentShape = currentSvg.append("circle");
  }

  // 设置通用的 class 或 style
  if (currentShape) {
    currentShape.attr("vector-effect", "non-scaling-stroke");
  }
  
  // 确保选中框图层总是在最上方
  createSelectionGroup();
};

// --- 核心优化：属性更新 (高频调用) ---
const updateAttributes = async () => {
  if (!currentSvg || !currentShape) return;

  const w = Number(props.width);
  const h = Number(props.height);
  const centerX = w / 2;
  const centerY = h / 2;
  const r = Math.min(w, h) / 2;
  const fillColor = props.color || "#bcecd4";
  
  // 更新通用属性 (跳过 Free 和部分特殊形状)
  if (props.shape !== "Free" && props.shape !== "Image") {
    currentShape
      .attr("fill", fillColor)
      .attr("stroke", props.strokeColor)
      .attr("stroke-width", props.strokeWidth);
  }

  // 更新 Marker 颜色 (Arrow)
  if (props.shape === "insertArrow") {
     currentSvg.select(`#arrow-${props.id} path`).attr("fill", props.color);
  }
  
  // 更新阴影颜色
  currentSvg.select(`#colored-shadow-${props.id} .shadow-element`)
    .attr("flood-color", fillColor);

  // 针对特定形状更新几何属性
  switch (props.shape) {
    case "circle":
      currentShape.attr("cx", centerX).attr("cy", centerY).attr("r", r);
      break;
    case "Rect":
      currentShape.attr("x", 0).attr("y", 0).attr("width", w).attr("height", h);
      break;
    case "Line":
      currentShape.attr("x1", 0).attr("y1", centerY).attr("x2", w).attr("y2", centerY).attr("stroke", fillColor); // Line use fill as stroke
      break;
    case "Text":
      // 字体大小计算
      const textLen = (props.text || "Text").length;
      let fitHeightSize = h * 0.6;
      let fitWidthSize = (w * 0.8) / Math.max(1, textLen);
      let finalFontSize = Math.max(12, Math.min(fitHeightSize, fitWidthSize));
      
      currentShape
        .attr("x", centerX).attr("y", centerY)
        .style("font-size", `${finalFontSize}px`)
        .style("font-weight", props.textWeight)
        .text(props.text || "Text");

      // 重置样式
      currentShape.style("font-style", "normal").style("text-decoration", "none");
      // 应用 BIUS
      props.BIUSArr.forEach(item => {
  const key = item as BIUS;
  if (biusMap[key]) {
    biusMap[key]();
  }
});
      break;
    case "Curve":
      const curveData = [{ x: 0, y: h }, { x: w * 0.5, y: 0 }, { x: w, y: h }];
      const curveFunc = line<{ x: number; y: number }>()
        .curve(curveBasis)
        .x((d) => d.x).y((d) => d.y);
      currentShape.attr("d", curveFunc(curveData) || "").attr("fill", "none").attr("stroke", fillColor);
      break;
    case "Triangle":
      currentShape.attr("points", `${centerX - r},${centerY - r} ${centerX + r},${centerY - r} ${centerX},${centerY + r}`);
      break;
    case "insertArrow":
      currentShape
        .attr("x1", 20).attr("y1", 20)
        .attr("x2", w - 20).attr("y2", h - 20)
        .attr("stroke", props.color) // Arrow main line
        .attr("marker-end", `url(#arrow-${props.id})`);
      break;
    case "insertStar":
      const starPoints = [];
      const outerRadius = r;
      const innerRadius = r * 0.38;
      for (let i = 0; i < 10; i++) {
        const angle = Math.PI / 2 + (i * Math.PI / 5);
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        starPoints.push(`${centerX + radius * Math.cos(angle)},${centerY - radius * Math.sin(angle)}`);
      }
      currentShape.attr("points", starPoints.join(" "));
      break;
    case "insertHeart":
      const heartPath = `
        M ${centerX},${centerY + r * 0.2}
        C ${centerX + r * 0.3},${centerY - r * 0.2} 
          ${centerX + r * 0.7},${centerY - r * 0.8} 
          ${centerX},${centerY - r * 0.6}
        C ${centerX - r * 0.7},${centerY - r * 0.8} 
          ${centerX - r * 0.3},${centerY - r * 0.2} 
          ${centerX},${centerY + r * 0.2}
        Z`;
      currentShape.attr("d", heartPath);
      break;
    case "Image":
      if (props.image && cachedImageElement) {
        cachedImageElement
          .attr("width", props.width).attr("height", props.height)
          .attr("stroke", props.strokeColor).attr("stroke-width", props.strokeWidth)
          .attr("fill", props.color || "none");
        
        // 只有当 href 改变时才重新加载图片，避免闪烁
        const currentHref = cachedImageElement.attr("href");
        if (currentHref !== props.image) {
            try {
                await loadImage(props.image);
                cachedImageElement.attr("href", props.image);
            } catch (e) { console.error("Image load failed"); }
        }
        
        const filterUrl = getFilterUrl(props.filter);
        cachedImageElement.attr("filter", filterUrl);
      }
      break;
    case "Free":
      if (brushArea) {
        brushArea
            .attr("width", w).attr("height", h)
            .attr("fill", props.color || "transparent");
        // 更新现有路径的颜色/粗细 (如果需要的话)
        if(currentPathGroup) {
            currentPathGroup.selectAll("path")
                .attr("stroke", props.strokeColor)
                .attr("stroke-width", props.strokeWidth);
        }
      }
      break;
    case "sticky":
      currentShape.attr("x", 0).attr("y", 0).attr("width", w).attr("height", h);
      updateStickyText(centerX,centerY);
      updateStickyTextColor();

  }

  // 更新选中框
  updateSelectionVisibility();
};

const updateStickyTextColor = () => {
  if (!currentShape) return;
  currentShape.select("text")
    .style("fill", props.textColor);
};
const updateStickyText = (centerX: number, centerY: number) => { 
  if (!currentShape) return;
  currentShape.select("text")
    .attr("x", centerX).attr("y", centerY)
    .text(props.text || "Sticky")
    .style("font-size", "16px")
    .style("font-weight", props.textWeight)
    .style("fill", props.textColor)
    .style("text-align", "center")
    .style("text-anchor", "middle")
    .style("dominant-baseline", "middle")
};

// --- 画笔功能 ---
const initBrushGroup = () => {
  // Free 模式下，brushGroup 可能会被复用，但这里我们先简单处理：只创建一次
  if (!currentPathGroup) {
      currentPathGroup = currentSvg!.append("g")
        .attr("class", "brush-group")
        .style("pointer-events", "none") as any;
  } else {
    // 确保它在正确的位置 (如果 DOM 顺序变了)
    currentSvg!.node()?.appendChild(currentPathGroup!.node() as Node);
  }

  // 渲染现有路径
  updateBrushPaths();

  brushArea = currentSvg!.append("rect")
    .attr("class", "brush-area")
    .attr("fill", props.color || "transparent") as any;

  brushArea!
    .on("mousedown", brushMouseDown)
    .on("mousemove", brushMouseMove)
    .on("mouseup", brushMouseUp)
    .on("mouseleave", brushMouseUp);
};

const updateBrushPaths = () => {
  if (!currentPathGroup || props.shape !== "Free") return;
  // Diff 路径：简单起见，这里还是采用全量刷新，因为 path 数组比属性复杂
  // 但由于 path 不会高频变化（只有绘制结束时才变），性能可接受
  currentPathGroup.selectAll("path").remove();
  
  if (props.path) {
    const paths = Array.isArray(props.path) ? props.path : [props.path];
    paths.forEach((pathData: string) => {
      if (pathData && pathData.trim()) {
        currentPathGroup!.append("path")
          .attr("d", pathData)
          .attr("stroke", props.strokeColor)
          .attr("stroke-width", props.strokeWidth)
          .attr("fill", "none")
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .attr("vector-effect", "non-scaling-stroke");
      }
    });
  }
};

// 交互事件处理 (保持不变，省略部分重复逻辑以节省篇幅，逻辑同原代码)
const brushMouseDown = (event: MouseEvent) => {
  if (event.button !== 0 || event.shiftKey) return;
  event.stopPropagation(); event.preventDefault();
  isBrushDrawing = true;
  currentPathData = '';
  const [x, y] = pointer(event, currentSvg!.node());
  currentPath = currentPathGroup!.append("path")
    .attr("stroke", props.strokeColor).attr("stroke-width", props.strokeWidth)
    .attr("fill", "none").attr("stroke-linecap", "round").attr("stroke-linejoin", "round")
    .attr("vector-effect", "non-scaling-stroke") as any;
  currentPathData = `M ${x} ${y}`;
  currentPath!.attr("d", currentPathData);
};

const brushMouseMove = (event: MouseEvent) => {
  if (!isBrushDrawing || !currentPath) return;
  event.stopPropagation();
  const [x, y] = pointer(event, currentSvg!.node());
  currentPathData += ` L ${x} ${y}`;
  currentPath.attr("d", currentPathData);
};

const brushMouseUp = (event: MouseEvent) => {
  if (!isBrushDrawing) return;
  event.stopPropagation();
  if (currentPath && currentPathData) emit('path-drawn', currentPathData, props.id);
  isBrushDrawing = false;
  currentPath = null;
  currentPathData = '';
};

// --- 选择框逻辑 ---
const createSelectionGroup = () => {
  if (!currentSvg) return;
  if (!selectionGroup) {
      selectionGroup = currentSvg.append("g")
        .attr("class", "selection-group")
        .style("pointer-events", "none") as any;
  } else {
      // 确保选择框永远在最上层
      currentSvg.node()?.appendChild(selectionGroup.node() as Node);
  }
  updateSelectionVisibility();
};

const updateSelectionBox = () => {
  if (!props.boxshow || !selectionGroup) return;

  const w = Number(props.width);
  const h = Number(props.height);

  selectionGroup.selectAll("*").remove();

  // 绘制虚线框
  selectionGroup.append("rect")
    .attr("x", 0).attr("y", 0).attr("width", w).attr("height", h)
    .attr("class", "selection-rect")
    .style("stroke", "#1890ff").style("stroke-width", 1).style("stroke-dasharray", "5,5")
    .style("fill", "transparent").attr("vector-effect", "non-scaling-stroke");

  const controlPoints = [
    { x: 0, y: 0, cursor: "nw-resize" }, { x: w, y: 0, cursor: "ne-resize" },
    { x: 0, y: h, cursor: "sw-resize" }, { x: w, y: h, cursor: "se-resize" },
    { x: w / 2, y: 0, cursor: "n-resize" }, { x: 0, y: h / 2, cursor: "w-resize" },
    { x: w / 2, y: h, cursor: "s-resize" }, { x: w, y: h / 2, cursor: "e-resize" },
  ];

  selectionGroup.selectAll(".control-point")
    .data(controlPoints).enter().append("circle")
    .attr("class", "control-point")
    .attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y).attr("r", 5)
    .attr("fill", "#fff").attr("stroke", "#1890ff").attr("stroke-width", 1)
    .style("cursor", (d: any) => d.cursor).style("pointer-events", "all")
    .attr("vector-effect", "non-scaling-stroke")
    .on("mousedown", function (event: MouseEvent, d: any) {
      event.stopPropagation();
      event.preventDefault();
      
      // 判断是否按下了 Alt 键
      if (event.altKey) {
        // 连线模式
        emit("connect-start", { event, direction: d.cursor, id: props.id });
      } else {
        // 缩放模式
        emit("resize-start", { event, direction: d.cursor, id: props.id });
      }
    });
    if (currentSvg) {
        currentSvg.on("mouseup", () => {
             emit("connect-end", { id: props.id });
        });
    }
};
const updateSelectionVisibility = () => {
  if (selectionGroup) {
    selectionGroup.style("display", props.boxshow ? "block" : "none");
    if (props.boxshow) {
      updateSelectionBox();
    }
  }
};

// --- 初始化与生命周期 ---
const render = async () => {
    if(!ensureSvgContainer()) return; // 1. 确保容器存在
    await createShapeDOM();           // 2. 确保形状 DOM 匹配 (Diff)
    await updateAttributes();         // 3. 更新属性 (Update)
};

// 监听器优化：将所有属性合为一个 watcher，但内部逻辑已优化为增量更新
watch(
  () => [
    props.shape, props.width, props.height, props.color,
    props.text, props.textSize, props.textWeight, props.BIUSArr,
    props.strokeColor, props.strokeWidth, props.scaleX, props.scaleY,
    props.image, props.filter, props.boxshow
  ],
  () => { render(); },
  { deep: true, flush: 'post' } // flush: post 确保 DOM 更新后执行
);

// 路径单独监听
watch(() => props.path, () => {
  if (props.shape === "Free") updateBrushPaths();
}, { deep: true });

onMounted(() => { render(); });

onUnmounted(() => {
  // 清理引用，防止内存泄漏
  shapeContainer.value = null;
  currentSvg = null;
  selectionGroup = null;
  currentShape = null;
  currentPathGroup = null;
  brushArea = null;
  cachedImageElement = null;
  imageCache.clear();
});
</script>

<style scoped>
.shape-container {
  width: 100%; height: 100%; display: block;
  transform: translateZ(0); position: relative;
}
/* 样式部分保持不变 */
.selection-rect { pointer-events: none; }
.control-point { pointer-events: all; transition: all 0.1s ease-out; transform: translateZ(0); }
.control-point:hover { fill: #1890ff; r: 6; transform: translateZ(0) scale(1.1); }
:deep(svg) { -webkit-user-drag: none; user-drag: none; }
:deep(.brush-area) { pointer-events: all; cursor: crosshair; }
:deep(.brush-group) { pointer-events: none; }
</style>