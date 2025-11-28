import type { MenuData } from "~/types/type";

export const availableShapes: MenuData[] = [
  { id: 'circle', label: '圆形', icon: 'pi pi-circle' },
  { id: 'Rect', label: '矩形', icon: 'pi pi-square' },
  { id: 'Line', label: '线条', icon: 'pi pi-minus' },
  { id: 'Text', label: '文本', icon: 'pi pi-font' },
  { id: 'Curve', label: '曲线', icon: 'pi pi-chart-line' },
  { id: 'Area', label: '区域', icon: 'pi pi-objects-column' },
  { id: 'Arc', label: '弧形', icon: 'pi pi-arrow-right-arrow-left' },
  { id: 'Pie', label: '饼图', icon: 'pi pi-chart-pie' }
];

// 字体粗细选项
export const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '100', value: '100' },
  { label: '200', value: '200' },
  { label: '300', value: '300' },
  { label: '400', value: '400' },
  { label: '500', value: '500' },
  { label: '600', value: '600' },
  { label: '700', value: '700' },
  { label: '800', value: '800' },
  { label: '900', value: '900' }
];