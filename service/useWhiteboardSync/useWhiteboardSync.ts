// composables/useWhiteboardSync.ts
import { io, Socket } from 'socket.io-client';
import type { WhithBoardItemProps } from '~/types/type';

export interface SocketCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onInitialElements?: (elements: any[]) => void;
  onElementCreated?: (element: WhithBoardItemProps) => void;
  onElementUpdated?: (id: number, data: any) => void;
  onElementDeleted?: (elementId: number) => void;
  onDrawUpdated?: (elementId: number, path: string) => void;
  onOnlineCount?: (count: number) => void;
}


export const useWhiteboardSync = (pageId: number = 1,callbacks: SocketCallbacks = {}) => { // 假设我们使用页面ID为1的页面
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);

  // 连接服务器
  const connect = () => {
    socket.value = io('http://localhost:3002'); // 连接到我们的Socket服务器

    socket.value.on('connect', () => {
      isConnected.value = true;
      callbacks.onConnected?.();
      socket.value?.emit('join_page', { pageId });
    });

    socket.value.on('initial_elements', ({ elements }) => {
      console.log('收到初始元素列表:', elements);
      callbacks.onInitialElements?.(elements);
    });

    socket.value.on('element_created', (newElement: WhithBoardItemProps) => {
      console.log('收到远程新元素:', newElement);
      callbacks.onElementCreated?.(newElement);
    });

    socket.value.on('element_updated', ({ id, data }) => {
      console.log('收到元素更新:', id, data);
      callbacks.onElementUpdated?.(id, data);
    });

    socket.value.on('element_deleted', (elementId: number) => {
      console.log('收到元素删除:', elementId);
      callbacks.onElementDeleted?.(elementId);
    });

    socket.value.on('draw_updated', ({ elementId, path }) => {
      console.log('收到画笔更新:', elementId);
      callbacks.onDrawUpdated?.(elementId, path);
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
      callbacks.onDisconnected?.();
    });

    socket.value.on('online_count', (count) => {
      console.log(`当前在线人数: ${count}`);
      callbacks.onOnlineCount?.(count);
    });
  };

  // 向服务器发送新建元素
  const sendCreateElement = (elementData: Omit<WhithBoardItemProps, 'id'>) => {
    if (!socket.value?.connected) return;
    socket.value.emit('element_create', elementData);
  };

  // 向服务器发送更新元素
  const sendUpdateElement = (id: number, data: Partial<WhithBoardItemProps>) => {
    if (!socket.value?.connected) return;
    console.log('发送更新元素:', id, data);
    socket.value.emit('element_update', { id, data });
  };

  // 向服务器发送删除元素
  const sendDeleteElement = (id: number) => {
    if (!socket.value?.connected) return;
    socket.value.emit('element_delete', id);
  };

  // 发送画笔路径更新（用于Free类型）
  const sendDrawUpdate = (elementId: number, path: string) => {
    if (!socket.value?.connected) return;
    socket.value.emit('draw_update', { elementId, path });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  };

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    sendCreateElement,
    sendUpdateElement,
    sendDeleteElement,
    sendDrawUpdate
  };
};