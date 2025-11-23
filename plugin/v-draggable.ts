// plugin/v-draggable.ts

// 扩展 HTMLElement 接口，添加自定义属性
declare global {
  interface HTMLElement {
    _onMouseDown?: (event: MouseEvent) => void;
    _onMouseMove?: (event: MouseEvent) => void;
    _onMouseUp?: () => void;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('draggable', {
    mounted(el: HTMLElement) {
      let startX = 0, startY = 0, currentX = 0, currentY = 0;
      let isDragging = false;

      el.style.position = "fixed";
      el.style.cursor = "move";

      const onMouseDown = (event: MouseEvent) => {
        if (isDragging) return;

        isDragging = true;
        startX = event.clientX - currentX;
        startY = event.clientY - currentY;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (event: MouseEvent) => {
        currentX = event.clientX - startX;
        currentY = event.clientY - startY;
        el.style.transform = `translate(${currentX}px, ${currentY}px)`;
      };

      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      el.addEventListener("mousedown", onMouseDown);

      // 存储事件处理函数引用用于清理
      el._onMouseDown = onMouseDown;
      el._onMouseMove = onMouseMove;
      el._onMouseUp = onMouseUp;
    },
    unmounted(el: HTMLElement) {
      el.removeEventListener("mousedown", el._onMouseDown!);
      document.removeEventListener("mousemove", el._onMouseMove!);
      document.removeEventListener("mouseup", el._onMouseUp!);
    }
  });
});