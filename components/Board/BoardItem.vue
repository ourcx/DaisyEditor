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
  'update:size': [size: { width: number; height: number }, id: number]
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
  id: 0
});

const shapeContainer = ref<HTMLElement | null>(null);
let currentSvg: any = null;
let selectionGroup: any = null;
let currentShape: any = null;

const MIN_SIZE = 50;
const MAX_SIZE = 1000;

// --- 1. 拖拽状态管理 (State) ---
const dragState = {
  isResizing: false,
  resizeType: '' as string | null,
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0
};
// ★★★ 关键点：在绘图时也确保使用 Number 类型，防止 SVG 属性报错
let safeWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, Number(props.width)));
let safeHeight = Math.max(MIN_SIZE, Math.min(MAX_SIZE, Number(props.height)));
// --- 2. 全局 MouseMove 处理函数 ---
const handleGlobalMouseMove = (event: MouseEvent) => {
  if (!dragState.isResizing || !dragState.resizeType) return;

  const dx = event.clientX - dragState.startX;
  const dy = event.clientY - dragState.startY;

  // 始终基于鼠标按下时的“初始数值”进行计算
  let newWidth = dragState.startWidth;
  let newHeight = dragState.startHeight;

  // 根据方向计算。
  // 注意：如果是拖拽左边(West)，dx 为负数时宽度应该增加，所以是减去 dx
  switch (dragState.resizeType) {
    case "nw-resize": // 左上
      newWidth = dragState.startWidth - dx;
      newHeight = dragState.startHeight - dy;
      break;
    case "ne-resize": // 右上
      newWidth = dragState.startWidth + dx;
      newHeight = dragState.startHeight - dy;
      break;
    case "sw-resize": // 左下
      newWidth = dragState.startWidth - dx;
      newHeight = dragState.startHeight + dy;
      break;
    case "se-resize": // 右下
      newWidth = dragState.startWidth + dx;
      newHeight = dragState.startHeight + dy;
      break;
  }

  // 限制范围
  newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newWidth));
  newHeight = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newHeight));

  // 只有数值发生实质变化才 emit
  // if (Math.round(newWidth) !== Math.round(Number(props.width)) ||
  //   Math.round(newHeight) !== Math.round(Number(props.height))) {

  //   emit('update:size', {
  //     width: Math.round(newWidth),
  //     height: Math.round(newHeight)
  //   }, props.id);
  // }
  //更新宽高
  safeWidth = Math.round(newWidth);
  safeHeight = Math.round(newHeight);
  init();
};

// --- 3. 全局 MouseUp 处理函数 ---
const handleGlobalMouseUp = () => {
  dragState.isResizing = false;
  dragState.resizeType = null;
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
};

// --- 4. 核心绘图逻辑 ---
const init = () => {
  if (!shapeContainer.value) return;

  // 清空旧内容
  shapeContainer.value.innerHTML = "";



  currentSvg = select((shapeContainer.value as unknown) as Element)
    .append("svg")
    .attr("width", safeWidth)
    .attr("height", safeHeight)
    .attr("viewBox", `0 0 ${safeWidth} ${safeHeight}`)
    .attr("preserveAspectRatio", "none") // 建议改为 none 或者是 xMidYMid meet 取决于需求
    .style("overflow", "visible"); // 允许控制点溢出

  const fillColor = props.color || "#bcecd4";
  const strokeColor = "#2d5a3d";
  const strokeWidth = 2;
  const centerX = safeWidth / 2;
  const centerY = safeHeight / 2;
  const maxSize = Math.min(safeWidth, safeHeight);
  const r = Math.min(safeWidth - 20, safeHeight - 20) / 2;

  // 创建选择框组
  selectionGroup = currentSvg.append("g")
    .attr("class", "selection-group")
    .style("display", props.boxshow ? "block" : "none");

  // 定义滤镜
  if (props.boxshow) {
    const defs = currentSvg.append("defs");
    const shadowFilter = defs.append("filter")
      .attr("id", `colored-shadow-${props.id}`) // 加上 ID 防止多个组件 ID 冲突
      .attr("x", "-50%").attr("y", "-50%")
      .attr("width", "200%").attr("height", "200%");

    shadowFilter.append("feDropShadow")
      .attr("stdDeviation", 8).attr("flood-color", fillColor).attr("flood-opacity", 1);
    shadowFilter.append("feDropShadow")
      .attr("dx", 1).attr("dy", 2).attr("stdDeviation", 3)
      .attr("flood-color", "#333333").attr("flood-opacity", 0.3);
  }

  currentShape = null;

  // 根据形状绘图
  switch (props.shape) {
    case "circle":
      currentShape = currentSvg.append("circle")
        .attr("cx", centerX).attr("cy", centerY).attr("r", r)
        .attr("width", safeWidth).attr("height", safeHeight)
        .attr("fill", fillColor).attr("stroke", strokeColor).attr("stroke-width", strokeWidth);
      break;
    case "Rect":
      const rectW = safeWidth * 0.8;
      const rectH = safeHeight * 0.8;
      currentShape = currentSvg.append("rect")
        .attr("x", (safeWidth - rectW) / 2)
        .attr("y", (safeHeight - rectH) / 2)
        .attr("width", rectW).attr("height", rectH)
        .attr("fill", fillColor).attr("stroke", strokeColor).attr("stroke-width", strokeWidth);
      break;
    case "Line":
      currentShape = currentSvg.append("line")
        .attr("x1", 10).attr("y1", centerY)
        .attr("x2", safeWidth - 10).attr("y2", centerY)
        .attr("stroke", fillColor).attr("stroke-width", 4).attr("stroke-linecap", "round");
      break;
    case "Text":
      currentShape = currentSvg.append("text")
        .attr("x", centerX).attr("y", centerY)
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("fill", strokeColor)
        .style("font-size", `${props.textSize}px`).style("font-weight", props.textWeight)
        .style("font-family", "system-ui, sans-serif")
        .text(props.text || "Text");
      break;
    case "Curve": {
      // 简单的曲线示例
      const curveData = [
        { x: safeWidth * 0.1, y: safeHeight * 0.9 },
        { x: safeWidth * 0.5, y: safeHeight * 0.1 },
        { x: safeWidth * 0.9, y: safeHeight * 0.9 }
      ];
      const curveFunc = line<{ x: number; y: number }>()
        .curve(curveBasis).x((d: any) => d.x).y((d: any) => d.y);
      currentShape = currentSvg.append("path")
        .datum(curveData).attr("d", curveFunc)
        .attr("stroke", fillColor).attr("fill", "none")
        .attr("stroke-width", 3).attr("stroke-linecap", "round");
      break;
    }
    // ... 其他 case (Area, Arc, Pie) 依据同样逻辑处理 ...
    default:
      // 默认圆形防止空白
      currentShape = currentSvg.append("circle")
        .attr("cx", centerX).attr("cy", centerY).attr("r", r)
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
  selectionGroup.append("rect")
    .attr("x", selectionX).attr("y", selectionY)
    .attr("width", selectionWidth).attr("height", selectionHeight)
    .attr("class", "selection-rect")
    .style("stroke", "#1890ff").style('stroke-width', 1).style("stroke-dasharray", "5,5")
    .style("fill", "none");

  // 2. 准备控制点位置
  const controlPoints = [
    { x: selectionX, y: selectionY, cursor: "nw-resize" }, // 左上
    { x: selectionX + selectionWidth, y: selectionY, cursor: "ne-resize" }, // 右上
    { x: selectionX, y: selectionY + selectionHeight, cursor: "sw-resize" }, // 左下
    { x: selectionX + selectionWidth, y: selectionY + selectionHeight, cursor: "se-resize" } // 右下
  ];

  // 3. 绘制控制点
  const controlPointsElements = selectionGroup.selectAll(".control-point")
    .data(controlPoints)
    .enter()
    .append("circle")
    .attr("class", "control-point")
    .attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y)
    .attr("r", 5)
    .attr("fill", "#fff").attr("stroke", "#1890ff").attr("stroke-width", 1)
    .style("cursor", (d: any) => d.cursor)
    .style("pointer-events", "all"); // 确保能点中

  // 4. 绑定 MouseDown 事件 (核心修复点)
  controlPointsElements.on("mousedown", function (event: MouseEvent, d: any) {
    event.stopPropagation();
    event.preventDefault();

    dragState.isResizing = true;
    dragState.resizeType = d.cursor;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;

    // ★★★★★ 终极修复 ★★★★★
    // 无论 props.width 传进来是 String 还是 Number，这里强制转为 Number
    // 如果转出来是 NaN，则给一个默认值 200
    dragState.startWidth = Number(props.width) || 200;
    dragState.startHeight = Number(props.height) || 200;

    // console.log('Start Resize:', dragState.startWidth, typeof dragState.startWidth); 
    // 如果需要调试，解开上面这行，控制台看到的必须是 number 类型

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  });
};

// 监听属性变化，重绘图形
watch(
  () => [props.shape, props.width, props.height, props.color, props.data, props.text, props.boxshow],
  () => {
    // 只有在非拖拽状态下，或者你需要实时更新视图时调用 init
    // 在这里调用 init 是安全的，因为 mousemove 的数据源是 dragState，不受 init 重置 DOM 的影响
    init();
  },
  { deep: true }
);

onMounted(() => {
  init();
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
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
  /* 关键：允许控制点溢出容器显示 */
}

.shape-container svg {
  display: block;
  overflow: visible;
  /* 关键：允许SVG内部元素溢出画布显示 */
}

.selection-rect {
  pointer-events: none;
}

.control-point {
  pointer-events: all;
  transition: r 0.2s, fill 0.2s;
}

.control-point:hover {
  fill: #1890ff;
  /* hover时变实心蓝 */
  r: 7;
}
</style>