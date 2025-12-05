// utils/getHandleCoordinate.ts

// 定义简单的矩形接口
interface RectInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 根据拉伸点方向（如 'nw-resize'）计算相对于 Rect 的具体坐标
 */
export const getHandleCoordinate = (rect: RectInfo, direction: string) => {
  // 如果传入的 rect 为空，返回默认坐标，防止崩溃
  if (!rect) return { x: 0, y: 0 };

  const { x, y, width, height } = rect;
  switch (direction) {
    case 'nw-resize': return { x: x, y: y }; // 左上
    case 'n-resize': return { x: x + width / 2, y: y }; // 上中
    case 'ne-resize': return { x: x + width, y: y }; // 右上
    case 'w-resize': return { x: x, y: y + height / 2 }; // 左中
    case 'e-resize': return { x: x + width, y: y + height / 2 }; // 右中
    case 'sw-resize': return { x: x, y: y + height }; // 左下
    case 's-resize': return { x: x + width / 2, y: y + height }; // 下中
    case 'se-resize': return { x: x + width, y: y + height }; // 右下
    case 'center': return { x: x + width / 2, y: y + height / 2 }; // 中心
    default: return { x: x + width / 2, y: y + height / 2 }; // 默认中心
  }
};