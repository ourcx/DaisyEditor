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
  boxshow: true, // 默认开启有色阴影
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
  const strokeColor = "#2d5a3d"; // 深绿色边框
  const strokeWidth = 2;

  // 计算中心点和尺寸
  const centerX = props.width / 2;
  const centerY = props.height / 2;
  const maxSize = Math.min(props.width, props.height);
  const r = Math.min(props.width - 20, props.height - 20) / 2;

  // 只有当 boxshow 为 true 时才添加有色阴影滤镜定义
  if (props.boxshow) {
    const defs = svg.append("defs");

    // 有色阴影滤镜 - 使用与填充色相匹配的颜色
    const shadowFilter = defs
      .append("filter")
      .attr("id", "colored-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    // 创建有色阴影
    shadowFilter
      .append("feDropShadow")
      // .attr("dx", 4)
      // .attr("dy", 4)
      .attr("stdDeviation", 8)
      .attr("flood-color", fillColor) // 使用与填充色相同的颜色
      .attr("flood-opacity", 1); // 降低不透明度

    // 可选：添加一个微妙的黑色阴影作为底色，增强立体感
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

      // 只有当 boxshow 为 true 时才应用有色阴影
      if (props.boxshow) {
        circle.attr("filter", "url(#colored-shadow)");
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
      }
      break;
    }

    case "Area": {
      const adjustedData = props.data.map((point: { x: number; y: number }) => ({
        x: (point.x / 200) * props.width * 0.8 + props.width * 0.1,
        y: (point.y / 120) * props.height * 0.8 + props.height * 0.1,
      }));

      // 创建区域生成器
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
    props.boxshow, // 监听 boxshow 的变化
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
</style>
