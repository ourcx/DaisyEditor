export const getHandleCoordinate = (rect: any, direction: string) => {
  const { x, y, width, height } = rect;
  switch (direction) {
    case 'nw-resize': return { x: x, y: y };
    case 'n-resize': return { x: x + width / 2, y: y };
    case 'ne-resize': return { x: x + width, y: y };
    case 'w-resize': return { x: x, y: y + height / 2 };
    case 'e-resize': return { x: x + width, y: y + height / 2 };
    case 'sw-resize': return { x: x, y: y + height };
    case 's-resize': return { x: x + width / 2, y: y + height };
    case 'se-resize': return { x: x + width, y: y + height };
    default: return { x: x + width / 2, y: y + height / 2 };
  }
};
