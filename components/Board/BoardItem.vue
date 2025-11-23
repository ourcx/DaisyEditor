<template>
  <div ref="shapeContainer" class="shape-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { select } from "d3-selection";
import { arc, pie, curveBasis, curveBasisClosed, line } from "d3-shape";
// 引入你提供的类型定义
import type { ShapesProps } from "~/types/components/type";

// 这里的 definePageMeta 是 Nuxt 特有的，如果不是页面组件可以忽略
definePageMeta({
  layout: false,
});

const emit = defineEmits<{
  "update:size": [size: { width: number; height: number; scaleX: number; scaleY: number }, id: number];
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
});

const ID = `${props.id}-svg`;
const shapeContainer = ref<HTMLElement | null>(null);
let currentSvg: any = null;
let selectionGroup: any = null;
let currentShape: any = null;

// --- 1. 拖拽状态管理 (State) ---
const dragState = {
  isResizing: false,
  resizeType: "" as string | null,
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
};
// ★★★ 关键点：在绘图时也确保使用 Number 类型，防止 SVG 属性报错
let safeWidth = Number(props.width);
let safeHeight = Number(props.height);
let newWidth: number = safeWidth;
let newHeight: number = safeHeight;
let scaleX = props.scaleX;
let scaleY = props.scaleY;

// 在 BoardItem 中添加
let animationFrameId: number | null = null;
const MIN_SIZE = 20;
const MAX_SIZE = 500;
// 修改 handleGlobalMouseMove
const handleGlobalMouseMove = (event: MouseEvent) => {
  if (!dragState.isResizing || !dragState.resizeType) return;

  // 使用requestAnimationFrame优化性能
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
    newWidth = dragState.startWidth + deltaWidth
    newHeight = dragState.startHeight + deltaHeight

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
      // 实时更新选择框
      updateSelectionBoxOnResize();
    }

    animationFrameId = null;
  });
};

// 修改 updateSelectionBoxOnResize
const updateSelectionBoxOnResize = () => {
  if (!selectionGroup || !currentShape) return;

  // 获取原始尺寸的边界框（不考虑缩放）
  const bbox = currentShape.node().getBBox();
  const padding = 8;
  const selectionX = bbox.x - padding;
  const selectionY = bbox.y - padding;
  const selectionWidth = bbox.width + padding * 2;
  const selectionHeight = bbox.height + padding * 2;

  // 更新选择框位置 - 使用原始坐标
  selectionGroup.select(".selection-rect")
    .attr("x", selectionX)
    .attr("y", selectionY)
    .attr("width", selectionWidth)
    .attr("height", selectionHeight);

  // 更新控制点位置
  const controlPoints = [
    { x: selectionX, y: selectionY },
    { x: selectionX + selectionWidth, y: selectionY },
    { x: selectionX, y: selectionY + selectionHeight },
    { x: selectionX + selectionWidth, y: selectionY + selectionHeight },
    { x: selectionX + selectionWidth / 2, y: selectionY },
    { x: selectionX, y: selectionY + selectionHeight / 2 },
    { x: selectionX + selectionWidth / 2, y: selectionY + selectionHeight },
    { x: selectionX + selectionWidth, y: selectionY + selectionHeight / 2 }
  ];

  selectionGroup.selectAll(".control-point")
    .data(controlPoints)
    .attr("cx", (d: any) => d.x)
    .attr("cy", (d: any) => d.y);
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

// --- 4. 核心绘图逻辑 ---
const init = () => {
  if (!shapeContainer.value) return;

  // 清空旧内容
  shapeContainer.value.innerHTML = "";

  // 使用 props 的原始尺寸初始化 SVG
  currentSvg = select((shapeContainer.value as unknown) as Element)
    .append("svg")
    .attr("class", ID)
    .attr("width", props.width)  // 使用原始宽度
    .attr("height", props.height) // 使用原始高度
    .attr("viewBox", `0 0 ${props.width} ${props.height}`)
    .attr("preserveAspectRatio", "none")
    .style("overflow", "visible");

  const fillColor = props.color || "#bcecd4";
  const strokeColor = "#2d5a3d";
  const strokeWidth = 2;
  const centerX = props.width / 2;
  const centerY = props.height / 2;
  const r = Math.min(props.width - 20, props.height - 20) / 2;

  // 创建选择框组
  selectionGroup = currentSvg
    .append("g")
    .attr("class", "selection-group")
    .style("display", props.boxshow ? "block" : "none");

  // 应用初始缩放
  console.log(scaleX, scaleY, "初始化的缩放比例");
  currentSvg.style("transform", `scale(${scaleX}, ${scaleY})`);

  // 定义滤镜
  if (props.boxshow) {
    const defs = currentSvg.append("defs");
    const shadowFilter = defs
      .append("filter")
      .attr("id", `colored-shadow-${props.id}`) // 加上 ID 防止多个组件 ID 冲突
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
  }

  currentShape = null;

  // 根据形状绘图
  switch (props.shape) {
    case "circle":
      currentShape = currentSvg
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", r)
        .attr("width", newWidth)
        .attr("height", newHeight)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);
      break;
    case "Rect":
      const rectW = newWidth * 0.8;
      const rectH = newHeight * 0.8;
      currentShape = currentSvg
        .append("rect")
        .attr("x", (newWidth - rectW) / 2)
        .attr("y", (newHeight - rectH) / 2)
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);
      break;
    case "Line":
      currentShape = currentSvg
        .append("line")
        .attr("x1", 10)
        .attr("y1", centerY)
        .attr("x2", newWidth - 10)
        .attr("y2", centerY)
        .attr("stroke", fillColor)
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "round");
      break;
    case "Text":
      currentShape = currentSvg
        .append("text")
        .attr("x", centerX)
        .attr("y", centerY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", strokeColor)
        .style("font-size", `${props.textSize}px`)
        .style("font-weight", props.textWeight)
        .style("font-family", "system-ui, sans-serif")
        .text(props.text || "Text");
      break;
    case "Curve": {
      // 简单的曲线示例
      const curveData = [
        { x: newWidth * 0.1, y: newHeight * 0.9 },
        { x: newWidth * 0.5, y: newHeight * 0.1 },
        { x: newWidth * 0.9, y: newHeight * 0.9 },
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
        .attr("stroke-linecap", "round");
      break;
    }
    // ... 其他 case (Area, Arc, Pie) 依据同样逻辑处理 ...
    default:
      // 默认圆形防止空白
      currentShape = currentSvg
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", r)
        .attr("fill", fillColor);
  }

  // 应用滤镜并绘制选择框
  if (props.boxshow && currentShape) {
    currentShape.attr("filter", `url(#colored-shadow-${props.id})`);
    // 使用 nextTick 确保 DOM 渲染后再计算 BBox
    nextTick(() => updateSelectionBox(currentShape));
  }
};

const updateSelectionBox = (shape: any) => {
  if (!shape || !props.boxshow || !selectionGroup) return;

  // 获取形状的边界框
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
    { x: selectionX, y: selectionY, cursor: "nw-resize" }, // 左上
    { x: selectionX + selectionWidth, y: selectionY, cursor: "ne-resize" }, // 右上
    { x: selectionX, y: selectionY + selectionHeight, cursor: "sw-resize" }, // 左下
    {
      x: selectionX + selectionWidth,
      y: selectionY + selectionHeight,
      cursor: "se-resize",
    }, // 右下
    { x: selectionX + selectionWidth / 2, y: selectionY, cursor: "n-resize" },
    { x: selectionX, y: selectionY + selectionHeight / 2, cursor: "w-resize" },
    { x: selectionX + selectionWidth / 2, y: selectionY + selectionHeight, cursor: "s-resize" },
    { x: selectionX + selectionWidth, y: selectionY + selectionHeight / 2, cursor: "e-resize" },

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
    .style("pointer-events", "all"); // 确保能点中

  // 4. 绑定 MouseDown 事件 (核心修复点)
  // 修改控制点事件处理
  controlPointsElements.on("mousedown", function (event: MouseEvent, d: any) {
    event.stopPropagation();
    event.preventDefault();

    dragState.isResizing = true;
    dragState.resizeType = d.cursor;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;

    // 使用当前的实际尺寸，而不是 props 的尺寸
    const svgElement = document.getElementsByClassName(ID)[0] as HTMLElement;
    if (svgElement) {
      dragState.startWidth = newWidth;  // 使用当前 newWidth
      dragState.startHeight = newHeight; // 使用当前 newHeight
    } else {
      dragState.startWidth = Number(props.width) || 200;
      dragState.startHeight = Number(props.height) || 200;
    }

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);
  });
};

// 监听属性变化，重绘图形
watch(
  () => [
    props.shape,
    props.width,
    props.height,
    props.color,
    props.data,
    props.text,
    props.boxshow,
  ],
  () => {
    init();
  },
  { deep: true }
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
</style>