import type { WhithBoardItemProps as WhithBoardProps } from '../types/type';

const BoardMeunList = {
  // 添加矩形
  addRect(x: number, y: number) {
    const newElement: WhithBoardProps = {
      id: Date.now(),
      type: "Rect",
      rect: {
        x: x,
        y: y,
        width: 100,
        height: 100
      },
      background: "#ffffff",
      borderWidth: 1,
      borderColor: "#000000",
    };
    return newElement;
  },

  // 添加圆形
  addCircle(x: number, y: number) {
    const newElement: WhithBoardProps = {
      id: Date.now(),
      type: "circle",
      rect: {
        x: x,
        y: y,
        width: 100,
        height: 100
      },
      background: "#ffffff",
      borderWidth: 1,
      borderColor: "#000000",
    };
    return newElement;
  },

  // 添加直线
  addLine(x: number, y: number) {
    const newElement: WhithBoardProps = {
      id: Date.now(),
      type: "Line",
      rect: {
        x: x,
        y: y,
        width: 100,
        height: 100
      },
      background: "#ffffff",
      borderWidth: 1,
      borderColor: "#000000",
    };
    return newElement;
  },

  // 添加文本
  addText(x: number, y: number) {
    const newElement: WhithBoardProps = {
      id: Date.now(),
      type: "Text",
      rect: {
        x: x,
        y: y,
        width: 100,
        height: 100
      },
      text: "请输入文本",
      textSize: 16,
      background: "#ffffff",
      borderWidth: 1,
      borderColor: "#000000",
    };
    return newElement;
  },

  // 添加图片
  addImage(x: number, y: number) {
    const newElement: WhithBoardProps = {
      id: Date.now(),
      type: "Image",
      rect: {
        x: x,
        y: y,
        width: 100,
        height: 100,
      },
      image: "https://picsum.photos/200/300",
      background: "#ffffff",
      borderWidth: 1,
      borderColor: "#000000",
      BIUSArr: [],
    };
    return newElement;
  },

  addTriangle(x: number, y: number) {
    const newElement: WhithBoardProps = {
      id: Date.now(),
      type: "Triangle",
      rect: {
        x: x,
        y: y,
        width: 100,
        height: 100
      },
      background: "#ffffff",
      borderWidth: 1,
      borderColor: "#000000",
      BIUSArr: [],
    };
    return newElement;
  },
  addInsertArrow(x: number, y: number) {
    const newElement: WhithBoardProps = {
      id: Date.now(),
      type: "insertArrow",
      rect: {
        x: x,
        y: y,
        width: 100,
        height: 100
      },
      background: "#000000",
      borderWidth: 1,
      borderColor: "#000000",
      BIUSArr: [],
      rotate: 0
    }
    return newElement
  },
  addInsertStar(x: number, y: number) {
    const newElement: WhithBoardProps = {
      id: Date.now(),
      type: "insertStar",
      rect: {
        x: x,
        y: y,
        width: 100,
        height: 100
      },
      background: "#ffffff",
      borderWidth: 1,
      borderColor: "#000000",
      BIUSArr: [],
    }
    return newElement
  },
  addInsertHeart(x: number, y: number) {
    const newElement: WhithBoardProps = {
      id: Date.now(),
      type: "insertHeart",
      rect: {
        x: x,
        y: y,
        width: 100,
        height: 100
      },
      background: "#ffffff",
      borderWidth: 1,
      borderColor: "#000000",
      BIUSArr: [],
    }
    return newElement
  }
};

export default BoardMeunList;