// composables/useEventManager.ts
import { ref, onUnmounted, type Ref } from 'vue'
import { throttle } from 'lodash-es'
import type { EventHandler } from '~/types/Event'


export function useEventManager() {
  const handlers = ref<EventHandler[]>([])
  const cleanupFunctions = ref<(() => void)[]>([])

  // 统一添加事件监听器
  const addEventListener = (
    element: EventTarget,
    type: string,
    handler: (event: any) => void,
    options?: AddEventListenerOptions
  ) => {
    element.addEventListener(type, handler, options)
    handlers.value.push({ element, type, handler, options })

    // 返回清理函数
    return () => {
      removeEventListener(element, type, handler)
    }
  }

  // 移除特定事件监听器
  const removeEventListener = (
    element: EventTarget,
    type: string,
    handler: (event: any) => void
  ) => {
    element.removeEventListener(type, handler)
    const index = handlers.value.findIndex(
      h => h.element === element && h.type === type && h.handler === handler
    )
    if (index > -1) {
      handlers.value.splice(index, 1)
    }
  }

  // 添加带节流的事件
  const addThrottledEventListener = (
    element: EventTarget,
    type: string,
    handler: (event: any) => void,
    delay: number = 16,
    options?: AddEventListenerOptions
  ) => {
    const throttledHandler = throttle(handler, delay, { leading: true, trailing: true })
    return addEventListener(element, type, throttledHandler, options)
  }

  // 批量添加事件
  const addEventListeners = (events: Omit<EventHandler, 'options'>[]) => {
    const cleanups = events.map(event =>
      addEventListener(event.element, event.type, event.handler)
    )
    return () => cleanups.forEach(cleanup => cleanup())
  }

  // 添加清理函数（用于非事件清理）
  const addCleanup = (cleanup: () => void) => {
    cleanupFunctions.value.push(cleanup)
  }

  // 清理所有事件和资源
  const cleanupAll = () => {
    // 移除所有事件监听器
    handlers.value.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler)
    })
    handlers.value = []

    // 执行所有清理函数
    cleanupFunctions.value.forEach(cleanup => cleanup())
    cleanupFunctions.value = []
  }




  //工具栏事件处理函数
  //工具栏调用这个函数，传入工具栏的id，然后根据id来处理事件，并且返回对应的清理函数和标准化的数据结构给页面处理
  const handleToolbarEvent = (toolbarId: string): [() => void] => {
    // 根据toolbarId处理不同的事件
    switch (toolbarId) {
      case 'toolbar1':
         
    }
    return [() => { }]
  }





  onUnmounted(cleanupAll)

  return {
    addEventListener,
    addThrottledEventListener,
    addEventListeners,
    removeEventListener,
    addCleanup,
    cleanupAll
  }
}