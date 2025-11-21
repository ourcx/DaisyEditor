export interface Rect { x: number; y: number; width: number; height: number; }
export interface WhithBoardItemProps { rect: Rect; type: string; background: string; borderWidth: number; borderColor: string; id: number; }
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
