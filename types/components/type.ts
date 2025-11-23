// ~/types/components/type.ts
export interface ShapesProps {
  id: number;
  width?: number;
  height?: number;
  shape?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  data?: Array<{ x: number; y: number }>;
  type?: string; // 添加这一行
  text?: string;
  textAlign?: string;
  textColor?: string;
  textSize?: number;
  textWeight?: number | string;
  cy?: number;
  cx?: number;
  r?: number;
  y?: number;
  x?: number;
  color?: string;
  size?: number;
  boxshow?: boolean;
    position?: ShapePosition;
  scaleX?: number;
  scaleY?: number;
}
type Shape = "circle" | "Rect" | "Segment" | "Text" | "Line" | "Curve" | "Area" | "Arc" | "Pie";
export interface Margin{
  top: number
  right: number
  bottom: number
  left: number
}
export interface ShapePosition {
  x: number;
  y: number;
}

export interface ShapeScale {
  width: number;
  height: number;
}

export interface menuProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    data?: menuData[];
    visible?: boolean;
}

export type menuData = {
    name: string;
    icon: string;
    action: string;
    params?: unknown;
};
