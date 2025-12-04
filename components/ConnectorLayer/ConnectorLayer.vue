<template>
  <svg class="connectors-layer">
    <defs>
      <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"
        markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#999" />
      </marker>
    </defs>

    <path v-for="conn in connectors" :key="conn.id" :d="calculateConnectorPath(conn)" stroke="#999" stroke-width="2"
      fill="none" marker-end="url(#arrow-head)" />

    <path v-if="connectionState.isConnecting"
      :d="`M ${connectionState.startX} ${connectionState.startY} L ${connectionState.endX} ${connectionState.endY}`"
      stroke="#2196f3" stroke-width="2" stroke-dasharray="5,5" fill="none" marker-end="url(#arrow-head)" />
  </svg>
</template>

<script setup lang="ts">
import type { ConnectionState, Connector, WhithBoardItemProps as WhithBoardProps } from '~/types/type'; // 引入你的类型定义
import { getHandleCoordinate } from '~/utils/getHandleCoordinate';


const props = defineProps<{
  connectors: Connector[];
  connectionState: ConnectionState;
  pages: WhithBoardProps[]; // 必须传入 pages，否则无法计算坐标
}>();

// --- 辅助函数：根据拉伸点方向获取坐标 ---

// --- 计算 SVG 路径 ---
const calculateConnectorPath = (conn: Connector) => {
  const sourcePage = props.pages.find(p => p.id === conn.sourceId);
  const targetPage = props.pages.find(p => p.id === conn.targetId);

  // 如果源或目标不存在（可能被删除了），则不渲染
  if (!sourcePage || !targetPage) return '';

  const start = getHandleCoordinate(sourcePage.rect, conn.sourcePoint);
  
  // 目标点默认计算为中心
  const end = {
    x: targetPage.rect.x + targetPage.rect.width / 2,
    y: targetPage.rect.y + targetPage.rect.height / 2
  };

  // 贝塞尔曲线逻辑
  const dx = end.x - start.x;
  // const dy = end.y - start.y;
  
  const cp1 = { x: start.x + dx * 0.5, y: start.y };
  const cp2 = { x: end.x - dx * 0.5, y: end.y };

  return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
};
</script>

<style scoped>
.connectors-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none; /* 关键：让鼠标事件穿透 SVG 层，直达下方的组件 */
  z-index: 0;
}
</style>