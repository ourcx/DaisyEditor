import { DRAWER_UI } from './constants';
import Rect from './drawer-rect';
import Text from './drawer-text';
import Line from './drawer-line';

type Params = {
  view: HTMLCanvasElement;
};
type CeilList = {
  path: Path2D;
  tag: string;
  params?: any;
  clickCallBack?: (val: any) => void;
};
type Info = {
  options: any;
  tag: string;
  path?: Path2D;
  params: any;
  clickCallBack: ((val: any) => void) | undefined;
};
class Drawer {
  view: HTMLCanvasElement;
  path: Path2D;
  ceilList: CeilList[];
  ctx: CanvasRenderingContext2D;
  constructor(params: Params) {
    this.view = params.view;
    this.ctx = params.view.getContext('2d')!;
    this.path = new Path2D();
    this.ceilList = [];
    this.init();
  }

  init() {
    this.bindEvent();
  }

  clickEvent(e: MouseEvent) {
    const { ctx } = this;
    const target = this.ceilList.find((ceil) =>
      ceil.tag === DRAWER_UI.RECT || ceil.tag === DRAWER_UI.TEXT
        ? ctx.isPointInPath(ceil.path, e.x, e.y)
        : ctx.isPointInStroke(ceil.path, e.x, e.y)
    );

    if (target && target.clickCallBack) {
      target.clickCallBack(target.params);
    }
  }

  bindEvent() {
    this.view.addEventListener('click', (e) => this.clickEvent(e));
  }

  drawRect(info: Info) {
    const {
      options: { isFill = true },
      path = new Path2D(),
      tag,
      params,
      clickCallBack,
    } = info;
    this.path.addPath(path);
    if (isFill) {
      this.ctx.fillStyle = '#32cd79';
      this.ctx.fill(this.path);
    } else {
      this.ctx.strokeStyle = '#32cd79';
      this.ctx.stroke(this.path);
    }

    this.ceilList.push({
      path,
      tag,
      params,
      clickCallBack,
    });
  }

  drawLine(info: Info) {
    const {
      options: { color = '#32cd79', lineWidth = 1, lineJoin = 'round' },
      path = new Path2D(),
      tag,
      params,
      clickCallBack,
    } = info;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineJoin = lineJoin;
    this.ctx.strokeStyle = color;
    this.ctx.stroke(path);
    this.ceilList.push({
      path,
      tag,
      params,
      clickCallBack,
    });
  }

  drawText(info: Info) {
    const {
      options: {
        x,
        y,
        text,
        font = '16px serif',
        isFill = true,
        color = '#32cd79',
      },
      tag,
      params,
      clickCallBack,
    } = info;
    const path = new Path2D();
    this.ctx.font = font.includes('serif') ? font : font + ' serif';
    const { width } = this.ctx.measureText(text);
    const height = Number(font.split(' ')[0].replace('px', ''));
    path.rect(x, y - height / 2, width, height);

    this.ctx.textBaseline = 'middle';
    if (isFill) {
      this.ctx.fillStyle = color;
      this.ctx.fillText(text, x, y);
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.strokeText(text, x, y);
    }
    this.ceilList.push({
      path,
      tag,
      params,
      clickCallBack,
    });
  }

  add(info: Info) {
    switch (info.tag) {
      case DRAWER_UI.TEXT:
        this.drawText(info);
        break;
      case DRAWER_UI.RECT:
        this.drawRect(info);
        break;
      default:
        this.drawLine(info);
        break;
    }
  }

  clear() {
    this.path = new Path2D();
    this.ceilList = [];
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}

export { Drawer, Rect, Text, Line };
