<template>
  <div ref="shapeContainer" class="shape-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { select } from "d3-selection";
import { arc, pie } from "d3-shape";
import { curveBasis } from "d3-shape";
import { line } from "d3-shape";
import type { ShapesProps } from "~/types/components/type";

definePageMeta({
  layout: false,
});

const props = withDefaults(defineProps<ShapesProps>(), {
  width: 150,
  height: 150,
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
  color: "#69b3a2",
  size: 20,
  boxshow: false,
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
  // 添加阴影滤镜定义
  if (props.boxshow) {
    const defs = svg.append("defs");

    // 主阴影滤镜
    const filter = defs
      .append("filter")
      .attr("id", "shadow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    // 创建阴影效果
    filter
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("stdDeviation", 3)
      .attr("flood-color", "rgba(0,0,0,0.3)")
      .attr("flood-opacity", 0.6);

    // 柔和发光效果滤镜
    const glowFilter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    glowFilter
      .append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 4)
      .attr("result", "blur");

    glowFilter
      .append("feFlood")
      .attr("flood-color", props.color)
      .attr("flood-opacity", 0.3)
      .attr("result", "glowColor");

    glowFilter
      .append("feComposite")
      .attr("in", "glowColor")
      .attr("in2", "blur")
      .attr("operator", "in")
      .attr("result", "softGlow");

    glowFilter
      .append("feMerge")
      .selectAll("feMergeNode")
      .data(["softGlow", "SourceGraphic"])
      .enter()
      .append("feMergeNode")
      .attr("in", (d) => d);
  }

  // 计算中心点
  const centerX = props.width / 2;
  const centerY = props.height / 2;
  const maxSize = Math.min(props.width, props.height);
  // 计算r
  const r = Math.min(props.width - 10, props.height - 10) / 2;

  switch (props.shape) {
    case "circle":
      const circle = svg
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", r)
        .attr("stroke", props.boxshow ? "rgba(16, 185, 129, 0.8)" : "black")
        .attr("fill", props.color)
        .attr("fill-opacity", props.boxshow ? 0.7 : 1)
        .attr("stroke-width", 5)
        .attr("stroke-opacity", 0.5);

      // 应用阴影效果
      if (props.boxshow) {
        circle.attr("filter", "url(#shadow)");
        // 可选：添加发光效果
        // circle.attr("filter", "url(#glow)");
        // 或者组合效果
        // circle.attr("filter", "url(#shadow) url(#glow)");
      }
      break;

    case "Rect":
      const rect = svg
        .append("rect")
        .attr("x", centerX - (props.width * 0.8) / 2)
        .attr("y", centerY - (props.height * 0.8) / 2)
        .attr("width", props.width * 0.8)
        .attr("height", props.height * 0.8)
        .attr("stroke", props.boxshow ? "rgba(16, 185, 129, 0.8)" : "black")
        .attr("fill", props.color)
        .attr("fill-opacity", props.boxshow ? 0.7 : 1)
        .attr("stroke-width", props.boxshow ? 2 : 1)
        .attr("stroke-dasharray", props.boxshow ? "4, 4" : "none");

      if (props.boxshow) {
        rect.attr("filter", "url(#shadow)");
      }
      break;

    case "Line":
      const lineElement = svg
        .append("line")
        .attr("x1", centerX - maxSize / 2)
        .attr("y1", centerY)
        .attr("x2", centerX + maxSize / 2)
        .attr("y2", centerY)
        .attr("stroke", props.color || "black")
        .attr("stroke-width", 2);

      if (props.boxshow) {
        lineElement.attr("filter", "url(#shadow)");
      }
      break;

    case "Text":
      const text = svg
        .append("text")
        .attr("x", centerX)
        .attr("y", centerY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", props.color || "black")
        .style("font-size", props.size + "px")
        .text(props.text || "示例文本");

      if (props.boxshow) {
        text.attr("filter", "url(#shadow)");
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
        .attr("stroke", props.color || "black")
        .attr("fill", "none")
        .attr("stroke-width", 2);

      if (props.boxshow) {
        curve.attr("filter", "url(#shadow)");
      }
      break;
    }

    case "Area": {
      const adjustedData = props.data.map((point: { x: number; y: number }) => ({
        x: (point.x / 200) * props.width * 0.8 + props.width * 0.1,
        y: (point.y / 120) * props.height * 0.8 + props.height * 0.1,
      }));

      const curveFunc = line<{ x: number; y: number }>()
        .curve(curveBasis)
        .x((d: any) => d.x)
        .y((d: any) => d.y);

      const area = svg
        .append("path")
        .datum(adjustedData)
        .attr("d", curveFunc)
        .attr("stroke", "black")
        .attr("fill", props.color)
        .attr("stroke-width", 2);

      if (props.boxshow) {
        area.attr("filter", "url(#shadow)");
      }
      break;
    }

    case "Arc": {
      const arcData = {
        startAngle: 0,
        endAngle: Math.PI * 1.5,
        innerRadius: maxSize / 3,
        outerRadius: maxSize / 2,
      };

      const arcGenerator = arc();

      const arcElement = svg
        .append("path")
        .attr("transform", `translate(${centerX},${centerY})`)
        .attr("d", arcGenerator(arcData) as string)
        .attr("fill", props.color);

      if (props.boxshow) {
        arcElement.attr("filter", "url(#shadow)");
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
  transition: all 0.3s ease;
}

.shape-container svg {
  display: block;
  margin: 0 auto;
}
</style>
