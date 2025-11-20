export interface EventHandler {
  element: EventTarget
  type: string
  handler: (event: any) => void
  options?: AddEventListenerOptions
}