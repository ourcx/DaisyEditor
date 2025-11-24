// 在 types/type.ts 中更新
export interface Rect { 
  x: number; 
  y: number; 
  width: number; 
  height: number;
  scaleX?: number; 
  scaleY?: number; 
}

export interface WhithBoardItemProps { 
  rect: Rect; 
  type: string; 
  background: string; 
  borderWidth: number; 
  borderColor: string; 
  id: number;
  text?: string;
  textSize?: number;
  textWeight?: string;
  image?: string;
}

export type AreaPoint = {
  startX: number
  startY: number
  endX: number
  endY: number
}

export type RectInfo = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface MenuItem {
  key: string
  label: string
  icon: string
  handler: () => void
}