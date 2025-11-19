import { DRAWER_UI } from './constants';

type Options = {
  x: number;
  y: number;
  width: number;
  height: number;
  isFill?: boolean;
  color?: string;
};
export default class Rect {
  options: Options;
  path: Path2D;
  tag: string;
  params: any;
  clickCallBack: ((val: any) => void) | undefined;
  constructor(options: Options, params: any) {
    this.options = options;
    this.path = new Path2D();
    this.tag = DRAWER_UI.RECT;
    this.params = params;
    this.init();
  }

  init() {
    this.path = this.draw();
  }

  draw() {
    const { x, y, width, height } = this.options;
    const path = new Path2D();
    path.rect(x, y, width, height);
    return path;
  }

  on(category: string, clickCallBack: (val: any) => void) {
    if (category === 'click') {
      this.clickCallBack = clickCallBack;
    }
  }
}
