
<template>
  <div ref="shapeContainer" class="shape-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { select } from "d3-selection";
import { arc, pie, curveBasis, curveBasisClosed, line } from "d3-shape";
import type { filter, ShapesProps } from "~/types/components/type";

definePageMeta({
  layout: false,
});

const emit = defineEmits<{
  "update:size": [
    size: { width: number; height: number; scaleX: number; scaleY: number },
    id: number
  ];
}>();

// 定义 Props，使用你提供的接口
const props = withDefaults(defineProps<ShapesProps>(), {
  width: 200,
  height: 200,
  shape: "circle",
  margin: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  data: () => [],
  type: "primary",
  text: "",
  textAlign: "center",
  textColor: "#333",
  textSize: 16,
  textWeight: 600,
  cy: 100,
  cx: 100,
  r: 50,
  y: 50,
  x: 50,
  color: "#bcecd4",
  size: 20,
  boxshow: true,
  id: 0,
  scaleX: 1,
  scaleY: 1,
  strokeColor: "#2d5a3d",
  strokeWidth: 2,
  image: "",
  filter: "none", // 默认不应用滤镜
});

const ID = `${props.id}-svg`;
const shapeContainer = ref<HTMLElement | null>(null);
let currentSvg: any = null;
let selectionGroup: any = null;
let currentShape: any = null;

// --- 图片缓存优化 ---
const imageCache = new Map();
let cachedImageElement: any = null;

// --- 拖拽状态管理 ---
const dragState = {
  isResizing: false,
  resizeType: "" as string | null,
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
};

let safeWidth = Number(props.width);
let safeHeight = Number(props.height);
let newWidth: number = safeWidth;
let newHeight: number = safeHeight;
let scaleX = props.scaleX;
let scaleY = props.scaleY;

let animationFrameId: number | null = null;

// --- 优化的图片加载函数 ---
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

// --- 创建滤镜定义 ---
const createFilterDefinitions = () => {
  if (!currentSvg) return;

  const defs = currentSvg.select("defs").node() 
    ? currentSvg.select("defs") 
    : currentSvg.append("defs");

  // 移除旧的滤镜定义
  defs.selectAll(`.filter-${props.id}`).remove();

  // 模糊滤镜
  const blurFilter = defs.append("filter")
    .attr("id", `blur-filter-${props.id}`)
    .attr("class", `filter-${props.id}`)
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  blurFilter.append("feGaussianBlur")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", 5);

  // 灰度滤镜
  const grayscaleFilter = defs.append("filter")
    .attr("id", `grayscale-filter-${props.id}`)
    .attr("class", `filter-${props.id}`);

  grayscaleFilter.append("feColorMatrix")
    .attr("type", "matrix")
    .attr("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0");

  // 反转滤镜
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

// --- 获取滤镜 URL ---
const getFilterUrl = (filterType: filter): string | null => {
  if (filterType === 'none') return null;
  console.log('getFilterUrl', filterType);
  //得到滤镜
  return `url(#${filterType}-filter-${props.id})`;
};

// --- 优化的图片渲染函数 ---
const renderImage = async (): Promise<any> => {
  if (!props.image) {
    console.warn("Image source is missing");
    return null;
  }

  try {
    // 清除之前的图片
    currentSvg.selectAll("image").remove();
    
    // 创建滤镜定义
    createFilterDefinitions();
    
    // 使用缓存的图片或加载新图片
    await loadImage(props.image);
    
    // 创建图片元素
    const imageElement = currentSvg
      .append("image")
      .attr("xlink:href", props.image)
      .attr("width", props.width)
      .attr("height", props.height)
      .attr("stroke", props.strokeColor)
      .attr("stroke-width", props.strokeWidth)
      .attr("fill", props.color || "none")
      .attr("preserveAspectRatio", "xMidYMid meet"); // 保持图片比例

    // 应用滤镜
    const filterUrl = getFilterUrl(props.filter);
    if (filterUrl) {
      imageElement.attr("filter", filterUrl);
    }

    // 添加悬停效果
    // imageElement
    //   .style("cursor", "pointer")
    //   .on("mouseover", function() {
    //     //@ts-ignore
    //     select(this).transition().duration(200).attr("opacity", 0.8);
    //   })
    //   .on("mouseout", function() {
    //     //@ts-ignore
    //     select(this).transition().duration(200).attr("opacity", 1);
    //   });

    cachedImageElement = imageElement;
    return imageElement;
  } catch (error) {
    console.error("Failed to load image:", props.image, error);
    
    // 加载失败时显示占位符
    const placeholder = currentSvg
      .append("rect")
      .attr("width", props.width)
      .attr("height", props.height)
      .attr("fill", "#f0f0f0")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1);
      
    currentSvg
      .append("text")
      .attr("x", props.width / 2)
      .attr("y", props.height / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#999")
      .text("图片加载失败");
      
    return placeholder;
  }
};

// --- 更新图片滤镜 ---
const updateImageFilter = (filterType: filter) => {
  if (!cachedImageElement || props.shape !== "Image") return;
  
  const filterUrl = getFilterUrl(filterType);
  
  if (filterUrl) {
    cachedImageElement.attr("filter", filterUrl);
  } else {
    cachedImageElement.attr("filter", null);
  }
};

// --- 选择框管理逻辑 ---
const createSelectionGroup = () => {
  if (!currentSvg) return;

  if (selectionGroup) {
    selectionGroup.remove();
  }

  selectionGroup = currentSvg
    .append("g")
    .attr("class", "selection-group")
    .style("display", props.boxshow ? "block" : "none");

  // 创建选择框阴影滤镜
  const fillColor = props.color || "#bcecd4";
  const defs = currentSvg.select("defs").node() 
    ? currentSvg.select("defs") 
    : currentSvg.append("defs");
    
  defs.select(`#colored-shadow-${props.id}`).remove();
  
  const shadowFilter = defs
    .append("filter")
    .attr("id", `colored-shadow-${props.id}`)
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  shadowFilter
    .append("feDropShadow")
    .attr("stdDeviation", 8)
    .attr("flood-color", fillColor)
    .attr("flood-opacity", 1);
  shadowFilter
    .append("feDropShadow")
    .attr("dx", 1)
    .attr("dy", 2)
    .attr("stdDeviation", 3)
    .attr("flood-color", "#333333")
    .attr("flood-opacity", 0.3);
};

const updateSelectionBox = (shape: any) => {
  if (!shape || !props.boxshow || !selectionGroup) return;

  const bbox = shape.node().getBBox();
  const padding = 8;
  const selectionX = bbox.x - padding;
  const selectionY = bbox.y - padding;
  const selectionWidth = bbox.width + padding * 2;
  const selectionHeight = bbox.height + padding * 2;

  selectionGroup.selectAll("*").remove();

  // 1. 绘制虚线框
  selectionGroup
    .append("rect")
    .attr("x", selectionX)
    .attr("y", selectionY)
    .attr("width", selectionWidth)
    .attr("height", selectionHeight)
    .attr("class", "selection-rect")
    .style("stroke", "#1890ff")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "5,5")
    .style("fill", "none");

  // 2. 准备控制点位置
  const controlPoints = [
    { x: selectionX, y: selectionY, cursor: "nw-resize" },
    { x: selectionX + selectionWidth, y: selectionY, cursor: "ne-resize" },
    { x: selectionX, y: selectionY + selectionHeight, cursor: "sw-resize" },
    {
      x: selectionX + selectionWidth,
      y: selectionY + selectionHeight,
      cursor: "se-resize",
    },
    { x: selectionX + selectionWidth / 2, y: selectionY, cursor: "n-resize" },
    { x: selectionX, y: selectionY + selectionHeight / 2, cursor: "w-resize" },
    {
      x: selectionX + selectionWidth / 2,
      y: selectionY + selectionHeight,
      cursor: "s-resize",
    },
    {
      x: selectionX + selectionWidth,
      y: selectionY + selectionHeight / 2,
      cursor: "e-resize",
    },
  ];

  // 3. 绘制控制点
  const controlPointsElements = selectionGroup
    .selectAll(".control-point")
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
    .style("pointer-events", "all");

  // 4. 绑定 MouseDown 事件
  controlPointsElements.on("mousedown", function (event: MouseEvent, d: any) {
    event.stopPropagation();
    event.preventDefault();

    dragState.isResizing = true;
    dragState.resizeType = d.cursor;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;

    const svgElement = document.getElementsByClassName(ID)[0] as HTMLElement;
    if (svgElement) {
      dragState.startWidth = newWidth;
      dragState.startHeight = newHeight;
    } else {
      dragState.startWidth = Number(props.width) || 200;
      dragState.startHeight = Number(props.height) || 200;
    }

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);
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

// --- 拖拽处理函数 ---
const handleGlobalMouseMove = (event: MouseEvent) => {
  if (!dragState.isResizing || !dragState.resizeType) return;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(() => {
    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;

    let deltaWidth = 0;
    let deltaHeight = 0;

    switch (dragState.resizeType) {
      case "nw-resize": // 左上
        deltaWidth = -dx;
        deltaHeight = -dy;
        break;
      case "ne-resize": // 右上
        deltaWidth = dx;
        deltaHeight = -dy;
        break;
      case "sw-resize": // 左下
        deltaWidth = -dx;
        deltaHeight = dy;
        break;
      case "se-resize": // 右下
        deltaWidth = dx;
        deltaHeight = dy;
        break;
      case "n-resize": // 上
        deltaHeight = -dy;
        break;
      case "e-resize": // 右
        deltaWidth = dx;
        break;
      case "s-resize": // 下
        deltaHeight = dy;
        break;
      case "w-resize": // 左
        deltaWidth = -dx;
        break;
    }

    // 计算新的尺寸
    newWidth = dragState.startWidth + deltaWidth;
    newHeight = dragState.startHeight + deltaHeight;

    // 计算缩放比例
    scaleX = newWidth / props.width;
    scaleY = newHeight / props.height;

    // 更新UI - 只使用transform
    const svgElement = document.getElementsByClassName(ID)[0] as HTMLElement;
    if (svgElement) {
      const transform = `scale(${scaleX}, ${scaleY})`;
      svgElement.style.transform = transform;
      //宽高也要更新
      svgElement.style.width = `${newWidth}px`;
      svgElement.style.height = `${newHeight}px`;
    }

    animationFrameId = null;
  });
};

const handleGlobalMouseUp = () => {
  dragState.isResizing = false;
  dragState.resizeType = null;
  document.removeEventListener("mousemove", handleGlobalMouseMove);
  document.removeEventListener("mouseup", handleGlobalMouseUp);

  // 只在结束时更新一次
  emit(
    "update:size",
    {
      width: newWidth,
      height: newHeight,
      scaleX: scaleX,
      scaleY: scaleY,
    },
    props.id
  );
};

// --- 核心绘图逻辑 ---
const init = async () => {
  if (!shapeContainer.value) return;

  // 清除容器但保留缓存的图片元素引用
  shapeContainer.value.innerHTML = "";
  // 重置当前形状引用，但保留缓存的图片元素
  if (props.shape !== "Image") {
    cachedImageElement = null;
  }

  currentSvg = select((shapeContainer.value as unknown) as Element)
    .append("svg")
    .attr("class", ID)
    .attr("width", props.width)
    .attr("height", props.height)
    .attr("viewBox", `0 0 ${props.width} ${props.height}`)
    .attr("preserveAspectRatio", "none")
    .style("overflow", "visible");

  const fillColor = props.color || "#bcecd4";
  const centerX = props.width / 2;
  const centerY = props.height / 2;
  const r = Math.min(props.width - 20, props.height - 20) / 2;

  // 应用初始缩放
  console.log(scaleX, scaleY, "初始化的缩放比例");
  currentSvg.style("transform", `scale(${scaleX}, ${scaleY})`);

  currentShape = null;

  // 根据形状绘图
  switch (props.shape) {
    case "circle":
      currentShape = currentSvg
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", r)
        .attr("fill", fillColor)
        .attr("stroke", props.strokeColor)
        .attr("stroke-width", props.strokeWidth);
      break;
    case "Rect":
      const rectW = props.width * 0.8;
      const rectH = props.height * 0.8;
      currentShape = currentSvg
        .append("rect")
        .attr("x", (props.width - rectW) / 2)
        .attr("y", (props.height - rectH) / 2)
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("fill", fillColor)
        .attr("stroke", props.strokeColor)
        .attr("stroke-width", props.strokeWidth);
      break;
    case "Line":
      currentShape = currentSvg
        .append("line")
        .attr("x1", props.width * 0.1)
        .attr("y1", centerY)
        .attr("x2", props.width * 0.9)
        .attr("y2", centerY)
        .attr("stroke", fillColor)
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "round")
        .attr("stroke", props.strokeColor)
        .attr("stroke-width", props.strokeWidth);
      break;
    case "Text":
      currentShape = currentSvg
        .append("text")
        .attr("x", centerX)
        .attr("y", centerY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", props.strokeColor)
        .style("font-size", `${props.textSize}px`)
        .style("font-weight", props.textWeight)
        .style("font-family", "system-ui, sans-serif")
        .text(props.text || "Text");
      break;
    case "Curve": {
      const curveData = [
        { x: props.width * 0.1, y: props.height * 0.9 },
        { x: props.width * 0.5, y: props.height * 0.1 },
        { x: props.width * 0.9, y: props.height * 0.9 },
      ];
      const curveFunc = line<{ x: number; y: number }>()
        .curve(curveBasis)
        .x((d: any) => d.x)
        .y((d: any) => d.y);
      currentShape = currentSvg
        .append("path")
        .datum(curveData)
        .attr("d", curveFunc)
        .attr("stroke", fillColor)
        .attr("fill", "none")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("stroke", props.strokeColor)
        .attr("stroke-width", props.strokeWidth);
      break;
    }
    case "Image":
      // 使用优化的图片渲染
      currentShape = await renderImage();
      break;
    default:
      currentShape = currentSvg
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", r)
        .attr("fill", fillColor);
  }

  createSelectionGroup();
  if (currentShape) {
    nextTick(() => updateSelectionBox(currentShape));
  }
};

// --- 监听器优化 ---
// 主要属性变化时重新初始化
watch(
  () => [
    props.shape,
    props.width,
    props.height,
    props.color,
    props.data,
    props.text,
    props.textSize,
    props.textWeight,
    props.strokeColor,
    props.strokeWidth,
  ],
  () => {
    init();
  }
);

// 单独监听图片源变化
watch(
  () => props.image,
  (newImage, oldImage) => {
    if (newImage !== oldImage && props.shape === "Image") {
      // 图片源改变时清除缓存并重新加载
      cachedImageElement = null;
      init();
    }
  }
);

// 单独监听滤镜变化
watch(
  () => props.filter,
  (newFilter, oldFilter) => {
    if (newFilter !== oldFilter && props.shape === "Image") {
      updateImageFilter(newFilter);
    }
  }
);

// 单独监听选择框显示状态
watch(
  () => props.boxshow,
  () => {
    updateSelectionVisibility();
  }
);

onMounted(() => {
  init();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

onUnmounted(() => {
  // 清理动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // 移除事件监听器
  document.removeEventListener("mousemove", handleGlobalMouseMove);
  document.removeEventListener("mouseup", handleGlobalMouseUp);

  // 清理 DOM 引用
  shapeContainer.value = null;
  currentSvg = null;
  selectionGroup = null;
  currentShape = null;
  cachedImageElement = null;
});
</script>

<style scoped>
.shape-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: visible;
  /* 启用硬件加速 */
  transform: translateZ(0);
}

.shape-container svg {
  display: block;
  overflow: visible;
  /* 平滑变换 */
  transition: transform 0.05s ease-out;
  transform-origin: 0 0;
  /* 启用硬件加速 */
  will-change: transform;
  backface-visibility: hidden;
}

.selection-rect {
  pointer-events: none;
}

.control-point {
  pointer-events: all;
  transition: all 0.1s ease-out;
  /* 启用硬件加速 */
  transform: translateZ(0);
}

.control-point:hover {
  fill: #1890ff;
  r: 6;
  /* 轻微放大效果 */
  transform: translateZ(0) scale(1.1);
}

/* 图片滤镜效果预览样式 */
.image-filter-preview {
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.image-filter-preview:hover {
  border-color: #1890ff;
}
</style>