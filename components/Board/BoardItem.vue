<template>
  <div ref="shapeContainer" class="shape-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { select } from "d3-selection";
import { arc, pie } from "d3-shape";
import { curveBasis, curveBasisClosed } from "d3-shape";
import { line } from "d3-shape";
import type { ShapesProps } from "~/types/components/type";

definePageMeta({
  layout: false,
});

const props = withDefaults(defineProps<ShapesProps>(), {
  width: 200,
  height: 200,
  shape: "circle",
  margin: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  data: () => [
    { x: 10, y: 10 },
    { x: 50, y: 80 },
    { x: 100, y: 40 },
    { x: 150, y: 100 },
    { x: 190, y: 30 },
  ],
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
});

const shapeContainer = ref<HTMLElement | null>(null);

const init = () => {
  if (!shapeContainer.value) return;

  // 清除容器内容
  shapeContainer.value.innerHTML = "";

  const svg = select((shapeContainer.value as unknown) as Element)
    .append("svg")
    .attr("width", props.width)
    .attr("height", props.height)
    .attr("viewBox", `0 0 ${props.width} ${props.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // 主颜色和边框颜色
  const fillColor = props.color || "#bcecd4";
  const strokeColor = "#2d5a3d";
  const strokeWidth = 2;

  // 计算中心点和尺寸
  const centerX = props.width / 2;
  const centerY = props.height / 2;
  const maxSize = Math.min(props.width, props.height);
  const r = Math.min(props.width - 20, props.height - 20) / 2;

  // 添加框选线组
  const selectionGroup = svg.append("g")
    .attr("class", "selection-group")
    .style("display", props.boxshow ? "block" : "none");

  // 框选线样式
  const selectionStyle = {
    stroke: "#1890ff",
    strokeWidth: 1,
    strokeDasharray: "5,5",
    fill: "none"
  };

  // 控制点样式
  const controlPointStyle = {
    fill: "#1890ff",
    stroke: "#fff",
    strokeWidth: 1,
    r: 4,
    cursor: "pointer"
  };

  let currentShape: any = null;
  let currentBBox: any = null;

  const updateSelectionBox = (shape: any) => {
    if (!shape || !props.boxshow) return;

    currentShape = shape;
    const bbox = shape.node().getBBox();
    currentBBox = bbox;

    // 添加一些边距
    const padding = 8;
    const selectionX = bbox.x - padding;
    const selectionY = bbox.y - padding;
    const selectionWidth = bbox.width + padding * 2;
    const selectionHeight = bbox.height + padding * 2;

    // 清除之前的框选线
    selectionGroup.selectAll("*").remove();

    // 绘制框选矩形
    selectionGroup.append("rect")
      .attr("x", selectionX)
      .attr("y", selectionY)
      .attr("width", selectionWidth)
      .attr("height", selectionHeight)
      .attr("class", "selection-rect")
      .style("stroke", selectionStyle.stroke)
      .style('stroke-width', selectionStyle.strokeWidth)
      .style("fill", selectionStyle.fill)
      .style("pointer-events", "none")
      .attr("fill", "none")
    // 绘制控制点（8个方向）
    const controlPoints = [
      // 四个角
      { x: selectionX, y: selectionY, cursor: "nw-resize" },
      { x: selectionX + selectionWidth, y: selectionY, cursor: "ne-resize" },
      { x: selectionX, y: selectionY + selectionHeight, cursor: "sw-resize" },
      { x: selectionX + selectionWidth, y: selectionY + selectionHeight, cursor: "se-resize" },
      // 四条边中点
      { x: selectionX + selectionWidth / 2, y: selectionY, cursor: "n-resize" },
      { x: selectionX + selectionWidth, y: selectionY + selectionHeight / 2, cursor: "e-resize" },
      { x: selectionX + selectionWidth / 2, y: selectionY + selectionHeight, cursor: "s-resize" },
      { x: selectionX, y: selectionY + selectionHeight / 2, cursor: "w-resize" }
    ];

    selectionGroup.selectAll(".control-point")
      .data(controlPoints)
      .enter()
      .append("circle")
      .attr("class", "control-point")
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y)
      .attr("r", controlPointStyle.r)
      .attr("fill", controlPointStyle.fill)
      .attr("stroke", controlPointStyle.stroke)
      .attr("stroke-width", controlPointStyle.strokeWidth)
      .style("cursor", (d: any) => d.cursor);

    // 添加鼠标事件
    addSelectionEvents(selectionGroup, selectionX, selectionY, selectionWidth, selectionHeight);
  };

  const addSelectionEvents = (group: any, x: number, y: number, width: number, height: number) => {
    let isDragging = false;
    let dragType: string | null = null;
    let startX: number, startY: number;
    let startWidth: number, startHeight: number;
    let startShapeX: number, startShapeY: number;

    // 框选矩形拖动事件
    group.select(".selection-rect")
      .on("mousedown", function (event: MouseEvent) {
        isDragging = true;
        dragType = "move";
        startX = event.clientX;
        startY = event.clientY;
        startShapeX = x;
        startShapeY = y;
        event.stopPropagation();
      });

    // 控制点拖动事件
    group.selectAll(".control-point")
      .on("mousedown", function (event: MouseEvent, d: any) {
        isDragging = true;
        dragType = d.cursor;
        startX = event.clientX;
        startY = event.clientY;
        startWidth = width;
        startHeight = height;
        startShapeX = x;
        startShapeY = y;
        event.stopPropagation();
      });

    // 鼠标移动事件
    svg.on("mousemove", function (event: MouseEvent) {
      if (!isDragging || !dragType) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      switch (dragType) {
        case "move":
          // 移动整个形状
          const newX = startShapeX + dx;
          const newY = startShapeY + dy;
          updateShapePosition(newX, newY, width, height);
          break;

        case "nw-resize":
          updateShapePosition(startShapeX + dx, startShapeY + dy, startWidth - dx, startHeight - dy);
          break;
        case "ne-resize":
          updateShapePosition(startShapeX, startShapeY + dy, startWidth + dx, startHeight - dy);
          break;
        case "sw-resize":
          updateShapePosition(startShapeX + dx, startShapeY, startWidth - dx, startHeight + dy);
          break;
        case "se-resize":
          updateShapePosition(startShapeX, startShapeY, startWidth + dx, startHeight + dy);
          break;

        case "n-resize":
          updateShapePosition(startShapeX, startShapeY + dy, startWidth, startHeight - dy);
          break;
        case "s-resize":
          updateShapePosition(startShapeX, startShapeY, startWidth, startHeight + dy);
          break;
        case "w-resize":
          updateShapePosition(startShapeX + dx, startShapeY, startWidth - dx, startHeight);
          break;
        case "e-resize":
          updateShapePosition(startShapeX, startShapeY, startWidth + dx, startHeight);
          break;
      }
    });

    // 鼠标释放事件
    svg.on("mouseup", function () {
      isDragging = false;
      dragType = null;
    });

    const updateShapePosition = (newX: number, newY: number, newWidth: number, newHeight: number) => {
      // 这里可以根据形状类型更新实际形状的位置和大小
      // 由于不同形状的更新方式不同，这里只是示例
      console.log("更新形状位置和大小:", { newX, newY, newWidth, newHeight });

      // 更新框选线位置
      selectionGroup.select(".selection-rect")
        .attr("x", newX)
        .attr("y", newY)
        .attr("width", newWidth)
        .attr("height", newHeight);

      // 更新控制点位置
      const updatedControlPoints = [
        { x: newX, y: newY, cursor: "nw-resize" },
        { x: newX + newWidth, y: newY, cursor: "ne-resize" },
        { x: newX, y: newY + newHeight, cursor: "sw-resize" },
        { x: newX + newWidth, y: newY + newHeight, cursor: "se-resize" },
        { x: newX + newWidth / 2, y: newY, cursor: "n-resize" },
        { x: newX + newWidth, y: newY + newHeight / 2, cursor: "e-resize" },
        { x: newX + newWidth / 2, y: newY + newHeight, cursor: "s-resize" },
        { x: newX, y: newY + newHeight / 2, cursor: "w-resize" }
      ];

      selectionGroup.selectAll(".control-point")
        .data(updatedControlPoints)
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    };
  };

  // 原有的阴影滤镜定义
  if (props.boxshow) {
    const defs = svg.append("defs");
    const shadowFilter = defs
      .append("filter")
      .attr("id", "colored-shadow")
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

  switch (props.shape) {
    case "circle":
      const circle = svg
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", r)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);

      if (props.boxshow) {
        circle.attr("filter", "url(#colored-shadow)");
        // 延迟更新框选线，确保形状已渲染
        setTimeout(() => updateSelectionBox(circle), 10);
      }
      break;

    case "Rect":
      const rectSize = Math.min(props.width, props.height) * 0.7;
      const rect = svg
        .append("rect")
        .attr("x", centerX - rectSize / 2)
        .attr("y", centerY - rectSize / 2)
        .attr("width", rectSize)
        .attr("height", rectSize)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);

      if (props.boxshow) {
        rect.attr("filter", "url(#colored-shadow)");
        setTimeout(() => updateSelectionBox(rect), 10);
      }
      break;

    case "Line":
      const lineElement = svg
        .append("line")
        .attr("x1", centerX - maxSize * 0.4)
        .attr("y1", centerY)
        .attr("x2", centerX + maxSize * 0.4)
        .attr("y2", centerY)
        .attr("stroke", fillColor)
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "round");

      if (props.boxshow) {
        lineElement.attr("filter", "url(#colored-shadow)");
        setTimeout(() => updateSelectionBox(lineElement), 10);
      }
      break;

    case "Text":
      const textElement = svg
        .append("text")
        .attr("x", centerX)
        .attr("y", centerY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", strokeColor)
        .style("font-size", `${props.textSize}px`)
        .style("font-weight", props.textWeight)
        .style("font-family", "system-ui, sans-serif")
        .text(props.text || "示例文本");

      if (props.boxshow) {
        textElement.attr("filter", "url(#colored-shadow)");
        setTimeout(() => updateSelectionBox(textElement), 10);
      }
      break;

    case "Curve": {
      const adjustedData = props.data.map((point: { x: number; y: number }) => ({
        x: (point.x / 200) * props.width * 0.8 + props.width * 0.1,
        y: (point.y / 120) * props.height * 0.8 + props.height * 0.1,
      }));

      const curveFunc = line<{ x: number; y: number }>()
        .curve(curveBasis)
        .x((d: any) => d.x)
        .y((d: any) => d.y);

      const curve = svg
        .append("path")
        .datum(adjustedData)
        .attr("d", curveFunc)
        .attr("stroke", fillColor)
        .attr("fill", "none")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round");

      if (props.boxshow) {
        curve.attr("filter", "url(#colored-shadow)");
        setTimeout(() => updateSelectionBox(curve), 10);
      }
      break;
    }

    case "Area": {
      const adjustedData = props.data.map((point: { x: number; y: number }) => ({
        x: (point.x / 200) * props.width * 0.8 + props.width * 0.1,
        y: (point.y / 120) * props.height * 0.8 + props.height * 0.1,
      }));

      const areaFunc = line<{ x: number; y: number }>()
        .curve(curveBasisClosed)
        .x((d: any) => d.x)
        .y((d: any) => d.y);

      const areaPath = areaFunc(adjustedData);

      const area = svg
        .append("path")
        .attr("d", areaPath)
        .attr("stroke", strokeColor)
        .attr("fill", fillColor)
        .attr("stroke-width", strokeWidth);

      if (props.boxshow) {
        area.attr("filter", "url(#colored-shadow)");
        setTimeout(() => updateSelectionBox(area), 10);
      }
      break;
    }

    case "Arc": {
      const arcData = {
        startAngle: 0,
        endAngle: Math.PI * 1.8,
        innerRadius: maxSize / 4,
        outerRadius: maxSize / 2,
      };

      const arcGenerator = arc();

      const arcElement = svg
        .append("path")
        .attr("transform", `translate(${centerX},${centerY})`)
        .attr("d", arcGenerator(arcData) as string)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);

      if (props.boxshow) {
        arcElement.attr("filter", "url(#colored-shadow)");
        setTimeout(() => updateSelectionBox(arcElement), 10);
      }
      break;
    }

    default:
      console.warn("未知图形类型:", props.shape);
  }
};

// 当props变化时重新绘制
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
});
</script>

<style scoped>
.shape-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: transparent;
}

.shape-container svg {
  display: block;
  margin: 0 auto;
}

/* 框选线样式 */
.selection-rect {
  pointer-events: all;
}

.control-point {
  pointer-events: all;
}

.control-point:hover {
  fill: #40a9ff;
  r: 5;
}
</style>