// 事件类型定义
export type EventType = 
  | 'mousedown' | 'mousemove' | 'mouseup' | 'click' | 'dblclick'
  | 'keydown' | 'keyup' | 'keypress'
  | 'touchstart' | 'touchmove' | 'touchend'
  | 'wheel' | 'contextmenu'
  | 'selection:changed' | 'element:created' | 'element:updated' | 'element:deleted'
  | 'tool:changed' | 'viewport:changed' | 'history:changed';

// 事件数据接口
export interface EventData {
  type: EventType;
  timestamp: number;
  source?: string;
  [key: string]: any;
}

// 鼠标事件数据
export interface MouseEventData extends EventData {
  position: { x: number; y: number };
  clientPosition: { x: number; y: number };
  button?: number;
  modifiers: {
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
  };
}

// 键盘事件数据
export interface KeyboardEventData extends EventData {
  key: string;
  code: string;
  modifiers: {
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
  };
}

// 事件回调函数类型
export type EventCallback<T extends EventData = EventData> = (data: T) => void;

// 订阅标识符
export interface Subscription {
  unsubscribe: () => void;
  eventType: EventType;
  id: string;
}