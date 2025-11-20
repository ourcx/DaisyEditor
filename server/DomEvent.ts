/// <reference lib="dom" />
import type { EventType, EventData, EventCallback, Subscription } from '../types/Event';
export class EventManager {
  private static instance: EventManager;
  private subscriptions: Map<EventType, Map<string, EventCallback>> = new Map();
  private nextId: number = 1;

  private constructor() {}

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  /**
   * 订阅事件
   */
  public subscribe<T extends EventData>(
    eventType: EventType,
    callback: EventCallback<T>,
    subscriberName?: string
  ): Subscription {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Map());
    }

    const id = `${subscriberName || 'anonymous'}_${this.nextId++}`;
    const eventSubscriptions = this.subscriptions.get(eventType)!;
    eventSubscriptions.set(id, callback as EventCallback);

    return {
      unsubscribe: () => {
        this.unsubscribe(eventType, id);
      },
      eventType,
      id
    };
  }

  /**
   * 取消订阅
   */
  private unsubscribe(eventType: EventType, id: string): boolean {
    const eventSubscriptions = this.subscriptions.get(eventType);
    if (eventSubscriptions && eventSubscriptions.has(id)) {
      eventSubscriptions.delete(id);
      
      // 如果没有订阅者了，清理事件类型
      if (eventSubscriptions.size === 0) {
        this.subscriptions.delete(eventType);
      }
      
      return true;
    }
    return false;
  }

  /**
   * 发布事件
   */
  public publish<T extends EventData>(eventData: T): void {
    const { type } = eventData;
    const eventSubscriptions = this.subscriptions.get(type);

    if (!eventSubscriptions || eventSubscriptions.size === 0) {
      return;
    }

    // 添加时间戳（如果不存在）
    if (!eventData.timestamp) {
      eventData.timestamp = performance.now();
    }

    // 执行所有回调
    eventSubscriptions.forEach((callback, id) => {
      try {
        callback(eventData);
      } catch (error) {
        console.error(`Error in event handler ${id} for ${type}:`, error);
      }
    });
  }

  /**
   * 获取订阅统计
   */
  public getSubscriptionStats(): { [eventType: string]: number } {
    const stats: { [eventType: string]: number } = {};
    
    this.subscriptions.forEach((subscribers, eventType) => {
      stats[eventType] = subscribers.size;
    });
    
    return stats;
  }

  /**
   * 清理所有订阅
   */
  public clear(): void {
    this.subscriptions.clear();
  }
}