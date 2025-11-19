import { DRAWER_UI } from './constants';

type Options = {
  x: number;
  y: number;
  text: string;
  font?: string;
  isFill?: boolean;
  color?: string;
};

export default class Text {
  options: Options;
  tag: string;
  params: any;
  clickCallBack: ((val: any) => void) | undefined;
  constructor(options: Options, params: any) {
    this.options = options;
    this.tag = DRAWER_UI.TEXT;
    this.params = params;
  }

  on(category: string, clickCallBack: (val: any) => void) {
    if (category === 'click') {
      this.clickCallBack = clickCallBack;
    }
  }
}
