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

const op = ref<InstanceType<typeof Popover>>()
// 定义 emits
const emit = defineEmits<{
  toolClick: [cur: string, valueKey: any];
}>();

const list = [
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
  sticky: [
    {
      name: "便利贴",
      icon: "pi-map-marker",
      key: "sticky"
    }
  ],
  arrow: [
    {
      name: "箭头",
      icon: "pi-arrow-right",
      key: "arrow"
    }
  ],
  table: [
    {
      name: "表格",
      icon: "pi-table",
      key: "table"
    }
  ],
  paintBrush: [
    {
      name: "画笔",
      icon: "pi-pencil",
      key: "PaintBrush"
    }
  ],
  mindmap: [
    {
      name: "思维导图",
      icon: "pi-sitemap",
      key: "mindmap"
    }
  ],
  image: [
    {
      name: "插入图片",
      icon: "pi-image",
      key: "Image"
    }
  ],
  section: [
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
  more: [
    {
      name: "打印",
      icon: "pi-print",
      key: "print"
    },
    {
      name: "导出",
      icon: "pi-download",
      key: "export"
    },
    {
      name: "导入",
      icon: "pi-upload",
      key: "import"
    },
    {
      name: "设置",
      icon: "pi-cog",
      key: "settings"
    },
    {
      name: "网格",
      icon: "pi-th-large",
      key: "grid"
    },
    {
      name: "全屏",
      icon: "pi-window-maximize",
      key: "fullscreen"
    },
    {
      name: "截图",
      icon: "pi-camera",
      key: "snapshot"
    }
  ]
}

const cur = ref<keyof typeof members>("shape")
const computedMembers = computed(() => {
  return members[cur.value]
})

const toggle = (event: Event, toolType: string) => {
  //event是父元素
  op.value?.hide();
  event.stopPropagation();
  nextTick(() => {
    op.value?.show(event);
    cur.value = toolType as keyof typeof members
  });
}

// 添加自定义工具的方法
const customTools = ref<Record<string, { name: string; icon: string; key: string }[]>>({});

/**
 * 添加自定义工具
 * @param category 工具类别
 * @param tools 工具数组
 */
const addCustomTools = (category: string, tools: { name: string; icon: string; key: string }[]) => {
  customTools.value[category] = tools;
};

/**
 * 更新工具列表
 * @param category 工具类别
 * @param tools 新的工具数组
 */
const updateTools = (category: keyof typeof members, tools: { name: string; icon: string; key: string }[]) => {
  members[category] = tools;
};

/**
 * 移除工具类别
 * @param category 要移除的工具类别
 */
const removeToolCategory = (category: string) => {
  if (members[category as keyof typeof members]) {
    delete members[category as keyof typeof members];
    if (cur.value === category) {
      cur.value = "shape"; // 切换到默认类别
    }
  }
};

/**
 * 获取当前工具类别
 * @returns 当前工具类别
 */
const getCurrentToolType = () => cur.value;

/**
 * 设置当前工具类别
 * @param toolType 工具类别
 */
const setCurrentToolType = (toolType: keyof typeof members) => {
  if (members[toolType]) {
    cur.value = toolType;
  }
};

/**
 * 获取所有工具类别
 * @returns 所有工具类别数组
 */
const getAllToolTypes = () => {
  return Object.keys(members) as Array<keyof typeof members>;
};

/**
 * 获取指定类别的工具列表
 * @param category 工具类别
 * @returns 工具列表
 */
const getToolsByCategory = (category: keyof typeof members) => {
  return members[category] || [];
};

/**
 * 显示工具栏
 * @param event 可选的事件对象，用于定位弹出框
 */
const show = (event?: Event) => {
  if (event) {
    op.value?.show(event);
  }
};

/**
 * 隐藏工具栏
 */
const hide = () => {
  op.value?.hide();
};

/**
 * 切换工具栏显示/隐藏状态
 * @param event 可选的事件对象，用于定位弹出框
 */
const toggleVisibility = (event?: Event) => {
  if (op.value) {
    toggle(event || new Event('click'), cur.value);
  }
};

/**
 * 重置工具栏到默认状态
 */
const reset = () => {
  cur.value = "shape";
};

// 根据父组件的处理函数动态设置工具激活状态
const activeTool = ref<string | null>(null);

// 监听外部工具选择
const setActiveTool = (toolType: string, toolKey: string) => {
  const toolCategory = Object.keys(members).find(category => 
    members[category as keyof typeof members]?.some(tool => tool.key === toolKey)
  ) as keyof typeof members;
  
  if (toolCategory) {
    cur.value = toolCategory;
    activeTool.value = toolKey;
  }
};

// 暴露给父组件的方法
defineExpose({
  addCustomTools,
  updateTools,
  removeToolCategory,
  getCurrentToolType,
  setCurrentToolType,
  getAllToolTypes,
  getToolsByCategory,
  show,
  hide,
  toggleVisibility,
  reset,
  setActiveTool,
  // 工具数据
  toolData: members,
  // 当前激活的工具
  activeTool: computed(() => activeTool.value),
  // Popover 实例
  popoverInstance: op
});
</script>

<style scoped>
.board-menu-item:hover {
  background-color: #f3f4f6;
}

.board-menu-item:active {
  background-color: #e5e7eb;
  transform: scale(0.95);
}

#whiteboard-toolbar-container {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

#whiteboard-toolbar-container button:hover {
  background-color: #a7f3d0;
}

#whiteboard-toolbar-container button:active {
  background-color: #6ee7b7;
}

/* 工具按钮激活状态 */
#whiteboard-toolbar-container button.active {
  background-color: #10b981;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #whiteboard-toolbar-container {
    left: 12px;
    padding: 0.5rem;
  }

}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  #whiteboard-toolbar-container {
    background-color: #1f2937;
    border-color: #374151;
  }

  .board-menu-item:hover {
    background-color: #374151;
  }

  #whiteboard-toolbar-container button:hover {
    background-color: #065f46;
  }
  
  #whiteboard-toolbar-container button.active {
    background-color: #059669;
  }
}
</style>