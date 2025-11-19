import { DRAWER_UI } from './constants';

type Options = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  lineWidth?: number;
  lineJoin?: CanvasLineJoin;
};

export default class Line {
  options: Options;
  path: Path2D;
  tag: string;
  params: any;
  clickCallBack: ((val: any) => void) | undefined;
  constructor(options: Options, params: any) {
    this.options = options;
    this.path = new Path2D();
    this.tag = DRAWER_UI.LINE;
    this.params = params;
    this.init();
  }

  init() {
    this.path = this.draw();
  }

  draw() {
    const { x1, y1, x2, y2 } = this.options;
    const path = new Path2D();
    path.moveTo(x1, y1);
    path.lineTo(x2, y2);
    return path;
  }

  on(category: string, clickCallBack: (val: any) => void) {
    if (category === 'click') {
      this.clickCallBack = clickCallBack;
    }
  }
}
