<template>
  <div ref="shapeContainer" class="shape-container" draggable="false"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { select } from "d3-selection";
import { curveBasis, line } from "d3-shape";
import type { BIUS, filter, ShapesProps } from "~/types/components/type";
import { pointer } from "d3-selection";

definePageMeta({
  layout: false,
});

const emit = defineEmits<{
  "resize-start": [payload: { event: MouseEvent; direction: string; id: number }];
  "path-drawn": [path: string, id: number];
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
let currentSvg: any = null;
let selectionGroup: any = null;
let currentShape: any = null;
const imageCache = new Map();
let cachedImageElement: any = null;

// 画笔相关变量
let isBrushDrawing: boolean = false;
let currentPath: any = null;
let currentPathGroup: any = null;
let brushArea: any = null; // 保存画笔区域引用
let currentPathData: string = ''; // 当前绘制中的路径数据

const biusMap: Record<BIUS, () => void> = {
  Bold: () => currentShape?.style("font-weight", Number(props.textWeight) * 2),
  Italic: () => currentShape?.style("font-style", "italic"),
  Underline: () => currentShape?.style("text-decoration", "underline"),
  Strikethrough: () => currentShape?.style("text-decoration", "line-through")
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (imageCache.has(src)) {
      resolve(imageCache.get(src));
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

// --- 滤镜定义 ---
const createFilterDefinitions = () => {
  if (!currentSvg) return;
  const defs = currentSvg.select("defs").node() ? currentSvg.select("defs") : currentSvg.append("defs");

  defs.selectAll(`.filter-${props.id}`).remove();

  // 1. 模糊
  const blurFilter = defs.append("filter")
    .attr("id", `blur-filter-${props.id}`)
    .attr("class", `filter-${props.id}`)
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");
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
  invertFilter.append("feComponentTransfer")
    .append("feFuncR")
    .attr("type", "table")
    .attr("tableValues", "1 0");
  invertFilter.select("feComponentTransfer")
    .append("feFuncG")
    .attr("type", "table")
    .attr("tableValues", "1 0");
  invertFilter.select("feComponentTransfer")
    .append("feFuncB")
    .attr("type", "table")
    .attr("tableValues", "1 0");
};

const getFilterUrl = (filterType: filter): string | null => {
  if (!filterType || filterType === 'none') return null;
  return `url(#${filterType}-filter-${props.id})`;
};

// --- 图片渲染 ---
const renderImage = async (): Promise<any> => {
  if (!props.image) return null;
  try {
    currentSvg.selectAll("image").remove();
    createFilterDefinitions();
    await loadImage(props.image);

    const imageElement = currentSvg.append("image")
      .attr("xlink:href", props.image)
      .attr("width", props.width)
      .attr("height", props.height)
      .attr("stroke", props.strokeColor)
      .attr("stroke-width", props.strokeWidth)
      .attr("fill", props.color || "none")
      .attr("preserveAspectRatio", "none");

    const filterUrl = getFilterUrl(props.filter);
    if (filterUrl) imageElement.attr("filter", filterUrl);

    cachedImageElement = imageElement;
    return imageElement;
  } catch (error) {
    return currentSvg.append("text")
      .attr("x", props.width / 2).attr("y", props.height / 2)
      .attr("text-anchor", "middle").text("Error");
  }
};

const updateImageFilter = (filterType: filter) => {
  if (!cachedImageElement || props.shape !== "Image") return;
  const filterUrl = getFilterUrl(filterType);
  cachedImageElement.attr("filter", filterUrl ? filterUrl : null);
};

// --- 画笔功能 ---
const initBrushGroup = () => {
  // 创建专门的画笔图层
  currentPathGroup = currentSvg.append("g")
    .attr("class", "brush-group")
    .style("pointer-events", "none");

  // 初始化现有路径（如果有）
  if (props.path) {
    const existingPaths = Array.isArray(props.path) ? props.path : [props.path];
    existingPaths.forEach((pathData: string) => {
      if (pathData && pathData.trim()) {
        currentPathGroup.append("path")
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

  // 为Free形状创建透明的绘图区域
  brushArea = currentSvg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", props.width)
    .attr("height", props.height)
    .attr("fill", props.color || "transparent")
    .attr("class", "brush-area");

  // 绑定画笔事件到绘图区域
  brushArea.on("mousedown", brushMouseDown)
    .on("mousemove", brushMouseMove)
    .on("mouseup", brushMouseUp)
    .on("mouseleave", brushMouseUp);

  return brushArea;
};

const brushMouseDown = (event: MouseEvent) => {
  if (event.button !== 0 || event.shiftKey) return;
  
  event.stopPropagation();
  event.preventDefault();

  isBrushDrawing = true;
  currentPathData = '';

  const [x, y] = pointer(event, currentSvg.node());

  // 创建新路径
  currentPath = currentPathGroup.append("path")
    .attr("stroke", props.strokeColor)
    .attr("stroke-width", props.strokeWidth)
    .attr("fill", "none")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("vector-effect", "non-scaling-stroke");

  // 初始化路径数据
  currentPathData = `M ${x} ${y}`;
  currentPath.attr("d", currentPathData);
};

const brushMouseMove = (event: MouseEvent) => {
  if (!isBrushDrawing || !currentPath) return;
  
  event.stopPropagation();
  
  const [x, y] = pointer(event, currentSvg.node());
  
  // 添加新的点
  currentPathData += ` L ${x} ${y}`;
  currentPath.attr("d", currentPathData);
};

const brushMouseUp = (event: MouseEvent) => {
  if (!isBrushDrawing) return;
  
  event.stopPropagation();
  
  // 发送路径数据给父组件
  if (currentPath && currentPathData) {
    emit('path-drawn', currentPathData, props.id);
  }

  isBrushDrawing = false;
  currentPath = null;
  currentPathData = '';
};

// 更新画笔路径（当props.path变化时）
const updateBrushPaths = () => {
  if (!currentPathGroup || props.shape !== "Free") return;
  
  // 清除所有现有路径
  currentPathGroup.selectAll("path").remove();
  
  // 重新绘制所有路径
  if (props.path) {
    const paths = Array.isArray(props.path) ? props.path : [props.path];
    paths.forEach((pathData: string) => {
      if (pathData && pathData.trim()) {
        currentPathGroup.append("path")
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

// --- 选择框逻辑 ---
const createSelectionGroup = () => {
  if (!currentSvg) return;
  if (selectionGroup) selectionGroup.remove();

  selectionGroup = currentSvg.append("g")
    .attr("class", "selection-group")
    .style("display", props.boxshow ? "block" : "none")
    .style("pointer-events", "none");

  // 选中框阴影
  const defs = currentSvg.select("defs").node() ? currentSvg.select("defs") : currentSvg.append("defs");
  defs.select(`#colored-shadow-${props.id}`).remove();
  const shadowFilter = defs.append("filter")
    .attr("id", `colored-shadow-${props.id}`)
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");
  shadowFilter.append("feDropShadow")
    .attr("stdDeviation", 8)
    .attr("flood-color", props.color || "#bcecd4")
    .attr("flood-opacity", 1);
};

const updateSelectionBox = (shape: any) => {
  if (!props.boxshow || !selectionGroup) return;

  const w = Number(props.width);
  const h = Number(props.height);

  selectionGroup.selectAll("*").remove();

  // 1. 绘制虚线框
  selectionGroup.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", w).attr("height", h)
    .attr("class", "selection-rect")
    .style("stroke", "#1890ff")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "5,5")
    .style("fill", "transparent")
    .attr("vector-effect", "non-scaling-stroke");

  // 2. 控制点
  const controlPoints = [
    { x: 0, y: 0, cursor: "nw-resize" },
    { x: w, y: 0, cursor: "ne-resize" },
    { x: 0, y: h, cursor: "sw-resize" },
    { x: w, y: h, cursor: "se-resize" },
    { x: w / 2, y: 0, cursor: "n-resize" },
    { x: 0, y: h / 2, cursor: "w-resize" },
    { x: w / 2, y: h, cursor: "s-resize" },
    { x: w, y: h / 2, cursor: "e-resize" },
  ];

  // 3. 绘制控制点
  const points = selectionGroup.selectAll(".control-point")
    .data(controlPoints)
    .enter()
    .append("circle")
    .attr("class", "control-point")
    .attr("cx", (d: any) => d.x)
    .attr("cy", (d: any) => d.y)
    .attr("r", 5)
    .attr("fill", "#fff")
    .attr("stroke", "#1890ff")
    .attr("stroke-width", 1)
    .style("cursor", (d: any) => d.cursor)
    .style("pointer-events", "all")
    .attr("vector-effect", "non-scaling-stroke");

  // 4. 绑定事件：通知父组件
  points.on("mousedown", function (event: MouseEvent, d: any) {
    event.stopPropagation();
    event.preventDefault();
    emit("resize-start", { event, direction: d.cursor, id: props.id });
  });
};

const updateSelectionVisibility = () => {
  if (selectionGroup) {
    selectionGroup.style("display", props.boxshow ? "block" : "none");
    if (props.boxshow && currentShape) {
      nextTick(() => updateSelectionBox(currentShape));
    }
  }
};

// --- 初始化与绘图核心 ---
const init = async () => {
  if (!shapeContainer.value) return;
  shapeContainer.value.innerHTML = "";

  // 重置画笔状态
  currentPathGroup = null;
  brushArea = null;

  if (props.shape !== "Image") cachedImageElement = null;

  const w = Number(props.width);
  const h = Number(props.height);

  // 创建 SVG
  currentSvg = select(shapeContainer.value as unknown as Element)
    .append("svg")
    .attr("class", ID)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("preserveAspectRatio", "none")
    .style("overflow", "visible")
    .style("display", "block");

  if (props.scaleX !== 1 || props.scaleY !== 1) {
    currentSvg.style("transform", `scale(${props.scaleX}, ${props.scaleY})`);
    currentSvg.style("transform-origin", "0 0");
  }

  const fillColor = props.color || "#bcecd4";
  const centerX = w / 2;
  const centerY = h / 2;
  const r = Math.min(w, h) / 2;

  currentShape = null;

  switch (props.shape) {
    case "circle":
      currentShape = currentSvg.append("circle")
        .attr("cx", centerX).attr("cy", centerY).attr("r", r)
        .attr("fill", fillColor)
        .attr("stroke", props.strokeColor).attr("stroke-width", props.strokeWidth)
        .attr("vector-effect", "non-scaling-stroke");
      break;
    case "Rect":
      currentShape = currentSvg.append("rect")
        .attr("x", 0).attr("y", 0).attr("width", w).attr("height", h)
        .attr("fill", fillColor)
        .attr("stroke", props.strokeColor).attr("stroke-width", props.strokeWidth)
        .attr("vector-effect", "non-scaling-stroke");
      break;
    case "Line":
      currentShape = currentSvg.append("line")
        .attr("x1", 0).attr("y1", centerY).attr("x2", w).attr("y2", centerY)
        .attr("stroke", fillColor).attr("stroke-width", props.strokeWidth)
        .attr("stroke-linecap", "round")
        .attr("stroke", props.strokeColor)
        .attr("vector-effect", "non-scaling-stroke");
      break;
    case "Text":
      const textLen = (props.text || "Text").length;
      let fitHeightSize = h * 0.6;
      let fitWidthSize = (w * 0.8) / Math.max(1, textLen);
      let finalFontSize = Math.max(12, Math.min(fitHeightSize, fitWidthSize));

      currentShape = currentSvg.append("text")
        .attr("x", centerX).attr("y", centerY)
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("fill", props.color)
        .style("font-size", `${finalFontSize}px`)
        .style("font-weight", props.textWeight)
        .text(props.text || "Text")
        .attr("stroke", props.strokeColor).attr("stroke-width", props.strokeWidth)
        .attr("vector-effect", "non-scaling-stroke")

      currentShape.style("font-weight", Number(props.textWeight));
      currentShape.style("font-style", "normal");
      currentShape.style("text-decoration", "none");

      for (const item of props.BIUSArr as BIUS[]) {
        if (biusMap[item]) {
          biusMap[item]();
        }
      }
      break;
    case "Curve":
      const curveData = [{ x: 0, y: h }, { x: w * 0.5, y: 0 }, { x: w, y: h }];
      const curveFunc = line<{ x: number; y: number }>()
        .curve(curveBasis)
        .x((d: any) => d.x)
        .y((d: any) => d.y);
      currentShape = currentSvg.append("path")
        .datum(curveData)
        .attr("d", curveFunc)
        .attr("stroke", fillColor)
        .attr("fill", "none")
        .attr("stroke-width", props.strokeWidth)
        .attr("vector-effect", "non-scaling-stroke");
      break;
    case "Image":
      currentShape = await renderImage();
      break;
    case "Triangle":
      currentShape = currentSvg.append("polygon")
        .attr("points", `${centerX - r},${centerY - r} ${centerX + r},${centerY - r} ${centerX},${centerY + r}`)
        .attr("fill", fillColor)
        .attr("stroke", props.strokeColor).attr("stroke-width", props.strokeWidth)
        .attr("vector-effect", "non-scaling-stroke");
      break;
    case "insertArrow":
      const defs = currentSvg.select("defs").node() ?
        currentSvg.select("defs") :
        currentSvg.append("defs");

      if (!defs.select("#arrow-" + props.id).node()) {
        defs.append("marker")
          .attr("id", "arrow-" + props.id)
          .attr("markerUnits", "strokeWidth")
          .attr("markerWidth", 12)
          .attr("markerHeight", 12)
          .attr("orient", "auto")
          .attr("viewBox", "0 -5 10 10")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", props.color)
          .attr("stroke-width", 1)
          .attr("stroke-linecap", "round");
      }

      currentShape = currentSvg.append("line")
        .attr("x1", 20)
        .attr("y1", 20)
        .attr("x2", w - 20)
        .attr("y2", h - 20)
        .attr("stroke", props.color)
        .attr("stroke-width", props.strokeWidth)
        .attr("marker-end", `url(#arrow-${props.id})`)
        .attr("vector-effect", "non-scaling-stroke");
      break;
    case "insertStar":
      const starPoints = [];
      const outerRadius = r;
      const innerRadius = r * 0.38;

      for (let i = 0; i < 10; i++) {
        const angle = Math.PI / 2 + (i * Math.PI / 5);
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY - radius * Math.sin(angle);
        starPoints.push(`${x},${y}`);
      }

      currentShape = currentSvg.append("polygon")
        .attr("points", starPoints.join(" "))
        .attr("fill", fillColor)
        .attr("stroke", props.strokeColor)
        .attr("stroke-width", props.strokeWidth)
        .attr("vector-effect", "non-scaling-stroke");
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
        Z
      `;

      currentShape = currentSvg.append("path")
        .attr("d", heartPath)
        .attr("fill", fillColor)
        .attr("stroke", props.strokeColor)
        .attr("stroke-width", props.strokeWidth)
        .attr("vector-effect", "non-scaling-stroke");
      break;
    case "Free":
      // 初始化画笔系统
      brushArea = initBrushGroup();
      currentShape = brushArea;
      break;
    default:
      currentShape = currentSvg.append("circle")
        .attr("cx", centerX).attr("cy", centerY).attr("r", r)
        .attr("fill", fillColor)
        .attr("vector-effect", "non-scaling-stroke");
  }

  createSelectionGroup();
  if (currentShape && props.shape !== "Free") {
    nextTick(() => updateSelectionBox(currentShape));
  }
};

// --- 监听属性变化 ---
watch(
  () => [
    props.shape,
    props.width,
    props.height,
    props.color,
    props.text,
    props.textSize,
    props.strokeColor,
    props.strokeWidth,
    props.scaleX,
    props.scaleY,
    props.BIUSArr
  ],
  () => {
    init();
  },
  { deep: true }
);

// 单独监听path变化
watch(() => props.path, () => {
  if (props.shape === "Free") {
    updateBrushPaths();
  }
}, { deep: true });

watch(() => props.image, () => {
  if (props.shape === "Image") {
    cachedImageElement = null;
    init();
  }
});

watch(() => props.filter, (val) => updateImageFilter(val));

watch(() => props.boxshow, () => updateSelectionVisibility());

onMounted(() => {
  init();
});

onUnmounted(() => {
  shapeContainer.value = null;
  currentSvg = null;
  selectionGroup = null;
  currentShape = null;
  currentPathGroup = null;
  brushArea = null;
});
</script>

<style scoped>
.shape-container {
  width: 100%;
  height: 100%;
  display: block;
  transform: translateZ(0);
  position: relative;
}

.selection-rect {
  pointer-events: none;
}

.control-point {
  pointer-events: all;
  transition: all 0.1s ease-out;
  transform: translateZ(0);
}

.control-point:hover {
  fill: #1890ff;
  r: 6;
  transform: translateZ(0) scale(1.1);
}

/* 确保SVG内容可交互 */
:deep(svg) {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -ms-user-drag: none;
  user-drag: none;
}

/* Free画笔区域的特殊样式 */
:deep(.brush-area) {
  pointer-events: all;
  cursor: crosshair;
}

:deep(.brush-group) {
  pointer-events: none;
}
</style>