import { MouseEventData, EventType, KeyboardEventData } from "~/types/Event";
import { EventManager } from "./DomEvent";


export class EventCapturerAdapter {
  private eventManager: EventManager;
  private canvas: HTMLCanvasElement;
  private isCapturing: boolean = false;
  private canvasRect: DOMRect = new DOMRect();
  private viewportTransform: DOMMatrix = new DOMMatrix();

  constructor(canvas: HTMLCanvasElement) {
    this.eventManager = EventManager.getInstance();
    this.canvas = canvas;
    this.updateCanvasRect();
  }

  /**
   * 开始捕获事件
   */
  public startCapture(): void {
    if (this.isCapturing) return;
    
    this.bindEventListeners();
    this.isCapturing = true;
    
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * 停止捕获事件
   */
  public stopCapture(): void {
    if (!this.isCapturing) return;
    
    this.unbindEventListeners();
    this.isCapturing = false;
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * 设置视口变换
   */
  public setViewportTransform(transform: DOMMatrix): void {
    this.viewportTransform = transform;
  }

  /**
   * 更新画布位置信息
   */
  public updateCanvasRect(): void {
    this.canvasRect = this.canvas.getBoundingClientRect();
  }

  /**
   * 绑定DOM事件监听器
   */
  private bindEventListeners(): void {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', this.handleMouseEvent.bind(this), true);
    this.canvas.addEventListener('mousemove', this.handleMouseEvent.bind(this), true);
    this.canvas.addEventListener('mouseup', this.handleMouseEvent.bind(this), true);
    this.canvas.addEventListener('click', this.handleMouseEvent.bind(this), true);
    this.canvas.addEventListener('dblclick', this.handleMouseEvent.bind(this), true);
    this.canvas.addEventListener('contextmenu', this.handleMouseEvent.bind(this), true);
    
    // 键盘事件
    document.addEventListener('keydown', this.handleKeyboardEvent.bind(this), true);
    document.addEventListener('keyup', this.handleKeyboardEvent.bind(this), true);
    
    // 触摸事件
    this.canvas.addEventListener('touchstart', this.handleTouchEvent.bind(this), { passive: false, capture: true });
    this.canvas.addEventListener('touchmove', this.handleTouchEvent.bind(this), { passive: false, capture: true });
    this.canvas.addEventListener('touchend', this.handleTouchEvent.bind(this), true);
    
    // 滚轮事件
    this.canvas.addEventListener('wheel', this.handleWheelEvent.bind(this), { passive: false, capture: true });
  }

  /**
   * 解绑DOM事件监听器
   */
  private unbindEventListeners(): void {
    // 鼠标事件
    this.canvas.removeEventListener('mousedown', this.handleMouseEvent.bind(this), true);
    this.canvas.removeEventListener('mousemove', this.handleMouseEvent.bind(this), true);
    this.canvas.removeEventListener('mouseup', this.handleMouseEvent.bind(this), true);
    this.canvas.removeEventListener('click', this.handleMouseEvent.bind(this), true);
    this.canvas.removeEventListener('dblclick', this.handleMouseEvent.bind(this), true);
    this.canvas.removeEventListener('contextmenu', this.handleMouseEvent.bind(this), true);
    
    // 键盘事件
    document.removeEventListener('keydown', this.handleKeyboardEvent.bind(this), true);
    document.removeEventListener('keyup', this.handleKeyboardEvent.bind(this), true);
    
    // 触摸事件
    this.canvas.removeEventListener('touchstart', this.handleTouchEvent.bind(this), true);
    this.canvas.removeEventListener('touchmove', this.handleTouchEvent.bind(this), true);
    this.canvas.removeEventListener('touchend', this.handleTouchEvent.bind(this), true);
    
    // 滚轮事件
    this.canvas.removeEventListener('wheel', this.handleWheelEvent.bind(this), true);
  }

  /**
   * 处理鼠标事件
   */
  private handleMouseEvent(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const clientPosition = { x: event.clientX, y: event.clientY };
    const position = this.clientToCanvas(clientPosition);

    const eventData: MouseEventData = {
      type: event.type as EventType,
      timestamp: performance.now(),
      source: 'mouse',
      position,
      clientPosition,
      button: event.button,
      modifiers: {
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      }
    };

    this.eventManager.publish(eventData);
  }

  /**
   * 处理键盘事件
   */
  private handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isCanvasActive()) return;

    event.preventDefault();
    event.stopPropagation();

    const eventData: KeyboardEventData = {
      type: event.type as EventType,
      timestamp: performance.now(),
      source: 'keyboard',
      key: event.key,
      code: event.code,
      modifiers: {
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      }
    };

    this.eventManager.publish(eventData);
  }

  /**
   * 处理触摸事件
   */
  private handleTouchEvent(event: TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.touches.length === 0) return;

    const touch = event.touches[0];
    const clientPosition = { x: touch.clientX, y: touch.clientY };
    const position = this.clientToCanvas(clientPosition);

    const eventData: MouseEventData = {
      type: event.type as EventType,
      timestamp: performance.now(),
      source: 'touch',
      position,
      clientPosition,
      modifiers: {
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      }
    };

    this.eventManager.publish(eventData);
  }

  /**
   * 处理滚轮事件
   */
  private handleWheelEvent(event: WheelEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const clientPosition = { x: event.clientX, y: event.clientY };
    const position = this.clientToCanvas(clientPosition);

    const eventData: MouseEventData & { delta: { x: number; y: number } } = {
      type: 'wheel',
      timestamp: performance.now(),
      source: 'wheel',
      position,
      clientPosition,
      delta: { x: event.deltaX, y: event.deltaY },
      modifiers: {
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      }
    };

    this.eventManager.publish(eventData);
  }

  /**
   * 客户端坐标转换为画布坐标
   */
  private clientToCanvas(clientPos: { x: number; y: number }): { x: number; y: number } {
    const canvasPos = {
      x: clientPos.x - this.canvasRect.left,
      y: clientPos.y - this.canvasRect.top,
    };

    const point = new DOMPoint(canvasPos.x, canvasPos.y);
    const transformed = point.matrixTransform(this.viewportTransform.inverse());

    return { x: transformed.x, y: transformed.y };
  }

  /**
   * 检查画布是否激活
   */
  private isCanvasActive(): boolean {
    return document.activeElement === this.canvas || 
           this.canvas.contains(document.activeElement);
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    this.updateCanvasRect();
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.stopCapture();
  }
}