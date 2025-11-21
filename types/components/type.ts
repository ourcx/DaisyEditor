export interface ShapesProps {
  width?: number;
  height?: number;
  shape?: Shape;
  margin?: Margin;
  data?: any;
  tyep?: "primary" | "success" | "warning" | "danger" | "info";
  text?: string;
  textAlign?: "left" | "center" | "right";
  textColor?: string;
  textSize?: number;
  textWeight?: number;
  cy?: number;
  cx?: number;
  r?: number;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
  boxshow?: boolean;
}

type Shape = "circle" | "Rect" | "Segment" | "Text" | "Line" | "Curve" | "Area" | "Arc" | "Pie";
export interface Margin{
  top: number
  right: number
  bottom: number
  left: number
}
