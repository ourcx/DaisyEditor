<template>
    <div class="board-menu board-menu-vertical z-40 w-auto h-auto bg-white shadow-lg rounded p-2 grid gap-2 grid-rows-4 grid-cols-4"
         v-if="visible"
         :style="{
             position: 'absolute',
             left: x + 'px',
             top: y + 'px'
         }">
        <!-- 标题占据首行全部列 -->
        <div class="text-2xl col-span-4 flex items-center justify-start weight">插入图形</div>
        
        <!-- 菜单项从第二行开始排列 -->
        <div class="board-menu-item flex items-center justify-center"
             v-for="item in data"
             :key="item.name"
             @click="handleClick(item)"
             v-tooltip.top="{ value: item.name, autoHide: true }">
            <i :class="`${item.icon} pi`"></i>
        </div>
    </div>
</template>

<script setup lang="ts">
interface menuProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    data?: menuData[];
    visible?: boolean;
}

type menuData = {
    name: string;
    icon: string;
    action: string;
    params?: unknown;
};

interface menuEmit {
    (e: "action", item: menuData): void;
}

const emit = defineEmits<menuEmit>();

const props = withDefaults(defineProps<menuProps>(), {
    x: 0,
    y: 0,
    width: 200,
    height: 300,
    data: () => [
        {
            name: "矩形",
            icon: "pi-stop", // 使用 stop 图标表示矩形
            action: "insertRectangle"
        },
        {
            name: "圆形",
            icon: "pi-circle",
            action: "insertCircle"
        },
        {
            name: "三角形",
            icon: "pi-caret-down", // 使用向下箭头表示三角形
            action: "insertTriangle"
        },
        {
            name: "直线",
            icon: "pi-minus",
            action: "insertLine"
        },
        {
            name: "文本",
            icon: "pi-file-edit", // 使用文件编辑图标表示文本
            action: "insertText"
        },
        {
            name: "图片",
            icon: "pi-image",
            action: "insertImage"
        },
        {
            name: "表格",
            icon: "pi-table",
            action: "insertTable"
        },
        {
            name: "箭头",
            icon: "pi-arrow-right",
            action: "insertArrow"
        },
        {
            name: "五角星",
            icon: "pi-star",
            action: "insertStar"
        },
        {
            name: "心形",
            icon: "pi-heart",
            action: "insertHeart"
        },
        {
            name: "云朵",
            icon: "pi-cloud",
            action: "insertCloud"
        }
    ],
    visible: false,
});

const handleClick = (item: menuData) => {
    console.log("点击了菜单项:", item);
    emit("action", item);
};
</script>

<style scoped>
.board-menu-item {
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 8px;
    border-radius: 4px;
}

.weight{
    font-weight: 600;
}

.board-menu-item:hover {
    background-color: #f5f5f5;
}

.board-menu-item i {
    font-size: 1.5rem;
    color: #495057;
}

</style>