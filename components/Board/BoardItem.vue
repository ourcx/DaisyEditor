<template>
  <div ref="shapeContainer" class="shape-container" draggable="false"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { select } from "d3-selection";
import { curveBasis, line } from "d3-shape";
import type { BIUS, filter, ShapesProps } from "~/types/components/type";

definePageMeta({
  layout: false,
});

// 定义事件：只负责通知父组件“开始缩放”
const emit = defineEmits<{
  "resize-start": [payload: { event: MouseEvent; direction: string; id: number }];
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
  boxshow: true, // 控制选中框显示
  id: 0,
  scaleX: 1,
  scaleY: 1,
  strokeColor: "#2d5a3d",
  strokeWidth: 2,
  image: "",
  filter: "none",
  BIUSArr: () => [],
});

const ID = `${props.id}-svg`;
const shapeContainer = ref<HTMLElement | null>(null);
let currentSvg: any = null;
let selectionGroup: any = null;
let currentShape: any = null;
const imageCache = new Map();
let cachedImageElement: any = null;
//渲染BIUSArr


const biusMap: Record<BIUS, () => void> = {
  Bold: () => currentShape.style("font-weight", Number(props.textWeight) * 2),
  Italic: () => currentShape.style("font-style", "italic"),
  Underline: () => currentShape.style("text-decoration", "underline"),
  Strikethrough: () => currentShape.style("text-decoration", "line-through")
};

// --- 基础工具函数：加载图片 ---
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

  // 移除旧滤镜防止堆积
  defs.selectAll(`.filter-${props.id}`).remove();

  // 1. 模糊
  const blurFilter = defs.append("filter").attr("id", `blur-filter-${props.id}`).attr("class", `filter-${props.id}`).attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
  blurFilter.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", 5);

  // 2. 灰度
  const grayscaleFilter = defs.append("filter").attr("id", `grayscale-filter-${props.id}`).attr("class", `filter-${props.id}`);
  grayscaleFilter.append("feColorMatrix").attr("type", "matrix").attr("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0");

  // 3. 反转
  const invertFilter = defs.append("filter").attr("id", `invert-filter-${props.id}`).attr("class", `filter-${props.id}`);
  invertFilter.append("feComponentTransfer").append("feFuncR").attr("type", "table").attr("tableValues", "1 0");
  invertFilter.select("feComponentTransfer").append("feFuncG").attr("type", "table").attr("tableValues", "1 0");
  invertFilter.select("feComponentTransfer").append("feFuncB").attr("type", "table").attr("tableValues", "1 0");
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
      .attr("width", props.width)   // 紧贴容器宽
      .attr("height", props.height) // 紧贴容器高
      .attr("stroke", props.strokeColor)
      .attr("stroke-width", props.strokeWidth)
      .attr("fill", props.color || "none")
      .attr("preserveAspectRatio", "none"); // 允许跟随容器拉伸

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

// --- 选择框逻辑 (只渲染 + 抛出事件) ---
const createSelectionGroup = () => {
  if (!currentSvg) return;
  if (selectionGroup) selectionGroup.remove();

  selectionGroup = currentSvg.append("g")
    .attr("class", "selection-group")
    .style("display", props.boxshow ? "block" : "none");

  // 选中框阴影
  const defs = currentSvg.select("defs").node() ? currentSvg.select("defs") : currentSvg.append("defs");
  defs.select(`#colored-shadow-${props.id}`).remove();
  const shadowFilter = defs.append("filter").attr("id", `colored-shadow-${props.id}`).attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
  shadowFilter.append("feDropShadow").attr("stdDeviation", 8).attr("flood-color", props.color || "#bcecd4").attr("flood-opacity", 1);
};

const updateSelectionBox = (shape: any) => {
  if (!props.boxshow || !selectionGroup) return;

  // 核心：直接使用 props 的宽高，确保框永远贴合容器外部
  const w = Number(props.width);
  const h = Number(props.height);

  selectionGroup.selectAll("*").remove();

  // 1. 绘制虚线框 (覆盖整个容器)
  selectionGroup.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", w).attr("height", h)
    .attr("class", "selection-rect")
    .style("stroke", "#1890ff")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "5,5")
    .style("fill", "transparent")
    .attr("vector-effect", "non-scaling-stroke");

  // 2. 定义控制点位置
  const controlPoints = [
    { x: 0, y: 0, cursor: "nw-resize" }, // 左上
    { x: w, y: 0, cursor: "ne-resize" }, // 右上
    { x: 0, y: h, cursor: "sw-resize" }, // 左下
    { x: w, y: h, cursor: "se-resize" }, // 右下
    { x: w / 2, y: 0, cursor: "n-resize" }, // 上
    { x: 0, y: h / 2, cursor: "w-resize" }, // 左
    { x: w / 2, y: h, cursor: "s-resize" }, // 下
    { x: w, y: h / 2, cursor: "e-resize" }, // 右
  ];

  // 3. 绘制控制点
  const points = selectionGroup.selectAll(".control-point")
    .data(controlPoints).enter().append("circle")
    .attr("class", "control-point")
    .attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y)
    .attr("r", 5)
    .attr("fill", "#fff").attr("stroke", "#1890ff").attr("stroke-width", 1)
    .style("cursor", (d: any) => d.cursor)
    .style("pointer-events", "all")
    .attr("vector-effect", "non-scaling-stroke");

  // 4. 绑定事件：通知父组件
  points.on("mousedown", function (event: MouseEvent, d: any) {
    event.stopPropagation();
    event.preventDefault();
    // 关键：把控制权交给父组件
    emit("resize-start", { event, direction: d.cursor, id: props.id });
  });
};

const updateSelectionVisibility = () => {
  console.log("updateSelectionVisibility", props.boxshow);
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
  if (props.shape !== "Image") cachedImageElement = null;

  const w = Number(props.width);
  const h = Number(props.height);

  // 创建 SVG
  // 宽度设为 100% 以填满父级 div，ViewBox 设为逻辑宽高保持比例/拉伸
  currentSvg = select((shapeContainer.value as unknown) as Element)
    .append("svg")
    .attr("class", ID)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("preserveAspectRatio", "none") // 允许拉伸
    .style("overflow", "visible")
    .style("display", "block"); // 防止底部出现空白间隙

  // 只有当 props 显式传入了缩放比例且不为1时才应用 transform
  // 现在的逻辑主要靠父组件改物理宽高，所以这里通常是 1
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
      // --- 文字自适应核心逻辑 ---
      const textLen = (props.text || "Text").length;
      // 策略：高度占60%，宽度每字占一点，取最小值，并设置下限
      let fitHeightSize = h * 0.6;
      let fitWidthSize = (w * 0.8) / Math.max(1, textLen);
      let finalFontSize = Math.max(12, Math.min(fitHeightSize, fitWidthSize));

      currentShape = currentSvg.append("text")
        .attr("x", centerX).attr("y", centerY)
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("fill", props.color)
        .style("font-size", `${finalFontSize}px`) // 动态字号
        .style("font-weight", props.textWeight)
        .text(props.text || "Text")
        .attr("stroke", props.strokeColor).attr("stroke-width", props.strokeWidth)
        .attr("vector-effect", "non-scaling-stroke")

      // 清除默认样式
      currentShape.style("font-weight", Number(props.textWeight));
      currentShape.style("font-style", "normal");
      currentShape.style("text-decoration", "none");

      // 应用激活样式
      for (const item of props.BIUSArr as BIUS[]) {
        if (biusMap[item]) {
          biusMap[item]();
        }
      }
      break;
    case "Curve":
      const curveData = [{ x: 0, y: h }, { x: w * 0.5, y: 0 }, { x: w, y: h }];
      const curveFunc = line<{ x: number; y: number }>().curve(curveBasis).x((d: any) => d.x).y((d: any) => d.y);
      currentShape = currentSvg.append("path")
        .datum(curveData).attr("d", curveFunc)
        .attr("stroke", fillColor).attr("fill", "none")
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
      // 先创建箭头定义
      const defs = currentSvg.select("defs").node() ?
        currentSvg.select("defs") :
        currentSvg.append("defs");

      // 检查是否已有箭头定义，避免重复创建
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

      // 绘制带箭头的线条（从左上到右下）
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
      // 计算五角星的10个顶点（5个外顶点和5个内顶点）
      const starPoints = [];
      const outerRadius = r;
      const innerRadius = r * 0.38; // 内径约为外径的38%

      for (let i = 0; i < 10; i++) {
        const angle = Math.PI / 2 + (i * Math.PI / 5); // 从顶部开始绘制
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY - radius * Math.sin(angle); // SVG坐标系Y轴向下
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
      // 使用标准心形方程
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
  console.log('heartPath', heartPath);

      currentShape = currentSvg.append("path")
        .attr("d", heartPath)
        .attr("fill", fillColor)
        .attr("stroke", props.strokeColor)
        .attr("stroke-width", props.strokeWidth)
        .attr("vector-effect", "non-scaling-stroke");
      break;
    default:
      currentShape = currentSvg.append("circle")
        .attr("cx", centerX).attr("cy", centerY).attr("r", r)
        .attr("fill", fillColor)
        .attr("vector-effect", "non-scaling-stroke");
  }

  createSelectionGroup();
  if (currentShape) {
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
  }
);

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
});
</script>

<style scoped>
.shape-container {
  /* 确保填满父级 div */
  width: 100%;
  height: 100%;
  display: block;
  transform: translateZ(0);
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

svg {
  -webkit-user-drag: none;
  /* Chrome, Safari, Opera */
  -khtml-user-drag: none;
  /* Konqueror */
  -moz-user-drag: none;
  /* Firefox */
  -ms-user-drag: none;
  /* Internet Explorer/Edge */
  user-drag: none;
  /* Standard syntax */
}
</style>