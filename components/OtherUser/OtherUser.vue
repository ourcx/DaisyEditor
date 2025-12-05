<template>
    <div class="user-cursor flex h-10 items-start justify-center fixed z-50 overflow-visible gap-2"
        :style="{ left: props.x + 'px', top: props.y + 'px' }">
        <div class="user-cursor-col h-10 w-1" :style="{ backgroundColor: props.color }"></div>
        <div class="user-cursor-name text-white w-auto h-10" :style="{ color: props.color }">{{ props.name }}</div>
    </div>
</template>



<script setup lang="ts">
interface OtherUserProps {
    name?: string;
    x?: number;
    y?: number;
    color?: string;
}

const props = withDefaults(defineProps<OtherUserProps>(), {
    name: "默认用户",
    x: 0,
    y: 0,
    color: "#32cd79"
})

</script>


<style scoped>
/* 一个闪烁动画 */
@keyframes blink {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
    100% {
        opacity: 1;
    }
}
.user-cursor {
    animation: blink 1s infinite;

}

</style>