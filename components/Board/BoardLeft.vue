<template>
  <Popover ref="op">
    <div class="grid grid-cols-2 gap-2 w-32">
      <span class="font-medium col-span-2 text-center mb-2">{{ cur }}</span>
      <div v-for="(value, key) in computedMembers" :key="key"
        class="board-menu-item flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        role="button" tabindex="0" @click="emitToolClick(value)">
        <i :class="`${value.icon} pi`"></i>
        <span class="text-xs">{{ value.name }}</span>
      </div>
    </div>
  </Popover>
  <div id="whiteboard-toolbar-container"
    class="fixed left-[22px]  bg-white shadow-lg rounded-lg z-50 transition-all duration-500 opacity-100 p-1 justify-center">
    <!-- 主要工具区域 -->
    <div class="h-[460px] relative w-10 flex flex-col gap-2">
      <!-- 形状 -->
      <div class="" v-for="value in list" @click="toggle($event, value.toolType)" :key="value.icon">
        <button type="button"
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-emerald-200 transition-colors">
          <i class="pi text-xl" :class="value.icon"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Popover from 'primevue/popover';

const op = ref()
// 定义 emits
const emit = defineEmits<{
  toolClick: [ cur: any, valueKey: any];
}>();

const list = [
  // "pi-window-maximize",
  // "pi-fon",
  // "pi-sticky-note",
  // "pi-arrow-right",
  // "pi-th-large",
  // "pi-table",
  // "pi-palette",
  // "pi-sitemap",
  // "pi-icons",
  // "pi-image",
  // "pi-ellipsis-h"
  {
    icon: "pi-window-maximize",
    toolType: "shape"
  },
  {
    icon: "pi-map-marker",
    toolType: "sticky"
  },
  {
    icon: "pi-arrow-right",
    toolType: "arrow"
  },
  {
    icon: "pi-th-large",
    toolType: "section"
  },
  {
    icon: "pi-table",
    toolType: "table"
  },
  {
    icon: "pi-palette",
    toolType: "paintBrush"
  },
  {
    icon: "pi-sitemap",
    toolType: "mindmap"
  },
  {
    icon: "pi-image",
    toolType: "image"
  },
  {
    icon: "pi-ellipsis-h",
    toolType: "more"
  }
]
// 工具点击事件处理
const emitToolClick = (valueKey: any) => {
  
  emit("toolClick", cur.value, valueKey);
};
const members: Record<string, { name: string; icon: string; key: string }[]> = {
  shape: [
    {
      name: "矩形",
      icon: "pi-stop",
      key: "Rect"
    },
    {
      name: "圆形",
      icon: "pi-circle",
      key: "Circle"
    },
    {
      name: "三角形",
      icon: "pi-caret-down",
      key: "Triangle"
    },
    {
      name: "直线",
      icon: "pi-minus",
      key: "Line"
    },
    {
      name: "文本",
      icon: "pi-file-edit",
      key: "Text"
    },
    {
      name: "图片",
      icon: "pi-image",
      key: "Image"
    },
    {
      name: "箭头",
      icon: "pi-arrow-right",
      key: "insertArrow"
    },
    {
      name: "五角星",
      icon: "pi-star",
      key: "insertStar"
    },
    {
      name: "心形",
      icon: "pi-heart",
      key: "insertHeart"
    }
  ],
  text: [
    {
      name: "文本",
      icon: "pi-file-edit",
      key: "Text"
    }
  ],
  paintBrush: [
    {
      name: "画笔",
      icon: "pi-pencil",
      key: "PaintBrush"
    }
  ],
  section:[
    {
      name: "切换页",
      icon: "pi-th-large",
      key: "section"
    },
    {
      name: "新增页",
      icon: "pi-plus",
      key: "addSection"
    }
  ],
  more:[
    {
      name: "打印",
      icon: "pi-ellipsis-h",
      key: "more"
    }
  ]
}

const cur = ref<keyof typeof members>("shape")
const computedMembers = computed(() => {
  return members[cur.value]
})

const toggle = (event: Event, toolType: string) => {
  //event是父元素
  op.value.hide();
  event.stopPropagation();
  nextTick(() => {
    op.value.show(event);
    cur.value = toolType as keyof typeof members
  });
}

defineExpose({
  // 可以在这里添加一些组件方法，比如显示/隐藏工具栏等
});
</script>

<style scoped>
/* 可以在这里添加一些自定义样式，如果需要的话 */
</style>