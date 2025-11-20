/// <reference lib="dom" />


export function AddRectElement(width: number, height: number,type?:string) {
    // 创建矩形元素
    const rect = document.createElement('div');
    
    function setStyle(x: number, y: number) {
        rect.style.position = 'fixed';
        rect.style.left = `${x}px`;
        rect.style.top = `${y}px`;
        rect.style.width = `${width}px`;
        rect.style.height = `${height}px`;
        rect.style.border = '2px dashed #000';
        rect.style.pointerEvents = 'none';
        rect.style.zIndex = '9999'; // 确保元素在最上层
        rect.style.transform = 'translate(-50%, -50%)'; // 让元素中心对准鼠标位置
    }
    
    // 初始位置设为(0,0)
    setStyle(0, 0);
    
    // 添加到文档中
    document.body.appendChild(rect);
    
    // 监听鼠标移动事件
    const handleMouseMove = (e: MouseEvent) => {
        setStyle(e.clientX, e.clientY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', () => {
        // 在窗口调整大小时保持当前位置
        const rectStyle = window.getComputedStyle(rect);
        const left = parseInt(rectStyle.left);
        const top = parseInt(rectStyle.top);
        setStyle(left, top);
    });
    
    // 返回一个对象，包含元素和销毁方法
    return {
        element: rect,
        destroy: () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', () => {});
            if (document.body.contains(rect)) {
                document.body.removeChild(rect);
            }
        },
        updateSize: (newWidth: number, newHeight: number) => {
            width = newWidth;
            height = newHeight;
            const rectStyle = window.getComputedStyle(rect);
            const left = parseInt(rectStyle.left);
            const top = parseInt(rectStyle.top);
            setStyle(left, top);
        }
    };
}

// 使用示例：
// const rect = AddRectElement(100, 50); // 创建100x50的矩形
// // 当不再需要时调用销毁
// rect.destroy();
// // 或者更新大小
// rect.updateSize(150, 75);