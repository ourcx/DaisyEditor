// composables/useWhiteboardSync.ts
import { io, Socket } from 'socket.io-client';
import type { WhithBoardItemProps } from '~/types/type';


export const useWhiteboardSync = (pageId: number = 1) => { // 假设我们使用页面ID为1的页面
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);

  // 连接服务器
  const connect = () => {
    socket.value = io('http://localhost:3002'); // 连接到我们的Socket服务器

    socket.value.on('connect', () => {
      isConnected.value = true;
      console.log('已连接到协同服务器');
      socket.value?.emit('join_page', { pageId });
    });

    socket.value.on('initial_elements', ({ elements }) => {
      console.log('收到初始元素列表:', elements);
      // 这里触发一个事件，让父组件用这些元素更新画布
    });

    socket.value.on('element_created', (newElement: WhithBoardItemProps) => {
      console.log('收到远程新元素:', newElement);
      // 触发事件，让父组件添加此元素到画布
    });

    socket.value.on('element_updated', ({ id, data }) => {
      console.log('收到元素更新:', id, data);
      // 触发事件，让父组件更新对应元素
    });

    socket.value.on('element_deleted', (elementId: number) => {
      console.log('收到元素删除:', elementId);
      // 触发事件，让父组件删除对应元素
    });

    socket.value.on('draw_updated', ({ elementId, path }) => {
      console.log('收到画笔更新:', elementId);
      // 触发事件，实时更新对应元素的路径
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
      console.log('已断开协同服务器连接');
    });

    socket.value.on('online_count', (count) => {
        console.log(`当前在线人数: ${count}`);
    })
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