import type { filter, Shape } from "./components/type";

// 在 types/type.ts 中更新
export interface Rect { 
  x: number; 
  y: number; 
  width: number; 
  height: number;
  scaleX?: number; 
  scaleY?: number; 
}

// 原来的连接器类型
export interface Connector {
  id: string;
  sourceId: number;
  sourcePoint: string;
  targetId: number;
  targetPoint: string;
}

// 在 WhithBoardItemProps 中添加 connections 属性
export interface WhithBoardItemProps { 
  rect: Rect; 
  type: Shape; 
  background: string; 
  borderWidth: number; 
  borderColor: string; 
  id: number;
  text?: string;
  textSize?: number;
  textWeight?: string;
  image?: string;
  filter?: filter;
  BIUSArr?: string[];
  //旋转
  rotate?: number;
  path?: any;
  // 新增：连接关系
  connections?: {
    incoming?: number[];  // 连接到我的元素ID数组
    outgoing?: number[];  // 我连接到的元素ID数组
    connectors?: Connector[]; // 详细的连接器信息
  };
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


export interface MenuData {
  id: Shape,
  label: string,
  icon: string,
}


// 定义连线的数据结构 (建议放在 types 文件中统一引用)
export interface Connector {
  id: string;
  sourceId: number;
  sourcePoint: string;
  targetId: number;
  targetPoint: string;
}

export interface ConnectionState {
  isConnecting: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}


// 在 types 文件中添加或完善以下类型定义
export interface ToolActionData {
  name: string;
  icon: string;
  key: string;
}

export interface BrushData {
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: string;
  background: string;
  borderWidth: number;
  borderColor: string;
  id: number;
  path: string;
  connections?: {
    incoming: number[];
    outgoing: number[];
    connectors: any[];
  };
}

export interface ToolActionHandlers {
  [key: string]: (valueKey: ToolActionData) => void;
}