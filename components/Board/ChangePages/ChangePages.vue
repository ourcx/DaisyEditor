<template>
    <!-- 选择项目对话框 -->
    <Dialog v-model:visible="visible" modal header="选择项目" :style="{ width: '50vw' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="card flex justify-center">
            <Listbox v-model="selectedProject" :options="IndexDBList" optionLabel="id" class="w-full">
                <template #option="slotProps">
                    <div class="flex items-center gap-20 justify-center">
                        <div class="text-2xl">{{ slotProps.option.id }}</div>
                        <div class="text-nowrap text-2xl text-gray-500">{{ slotProps.option.timestamp }}</div>
                    </div>
                </template>
            </Listbox>
        </div>
        <template #footer>
            <Button label="取消" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
            <Button label="确定" icon="pi pi-check" @click="confirmSelection" autofocus />
        </template>
    </Dialog>
    
    <!-- 添加项目对话框 -->
    <Dialog v-model:visible="addVisible" modal header="添加项目" :style="{ width: '50vw' }">
        <div class="card flex justify-center">
            <div class="flex items-center gap-20 justify-center w-full">
                <InputText v-model="newProjectName" placeholder="请输入项目名" class="w-full" 
                    @keyup.enter="addProject" />
                <Button label="添加" @click="addProject" class="w-2/6" />
            </div>
        </div>
        <template #footer>
            <Button label="取消" icon="pi pi-times" @click="closeAddDialog" class="p-button-text" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import StorageIndexDB from "~/utils/storage";

const storageIndexDB = new StorageIndexDB();

// 定义Props
const props = withDefaults(defineProps<{
    visible?: boolean;
    addVisible?: boolean;
}>(), {
    visible: false,
    addVisible: false
});

// 定义Emit事件
const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'update:addVisible', value: boolean): void;
    (e: 'select', project: any): void;
    (e: 'add', project: any): void;
}>();

// 响应式数据
const IndexDBList = ref<any[]>([]);
const selectedProject = ref<any>(null);
const newProjectName = ref('');

// 计算属性或方法
const visible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const addVisible = computed({
    get: () => props.addVisible,
    set: (value) => emit('update:addVisible', value)
});

// 生命周期
onMounted(() => {
    loadProjects();
});

// 加载项目列表
const loadProjects = async () => {
    try {
        const data = await storageIndexDB.getAllData();
        IndexDBList.value = data;
    } catch (error) {
        console.error("加载项目列表失败:", error);
    }
};

// 添加项目
const addProject = async () => {
    if (!newProjectName.value.trim()) {
        // 可以添加一个提示，比如使用Toast组件
        // 这里生成随机项目名作为示例
        newProjectName.value = `项目_${Date.now()}`;
    }

    try {
        // 创建新项目对象
        const newProject = {
            id: newProjectName.value.trim(),
            timestamp: new Date().toLocaleString(),
            createdAt: Date.now()
        };

        // 保存到IndexDB
        await storageIndexDB.saveData([], newProject.id);
        
        // 添加到列表
        IndexDBList.value.unshift(newProject);
        
        // 选中新添加的项目
        selectedProject.value = newProject;
        
        // 通知父组件
        emit('add', newProject);
        
        // 关闭添加对话框
        addVisible.value = false;
        
        // 清空输入框
        newProjectName.value = '';
        
        // 可以选择自动打开选择对话框并选中新项目
        // visible.value = true;
        
    } catch (error) {
        console.error("添加项目失败:", error);
    }
};

// 确认选择
const confirmSelection = () => {
    if (selectedProject.value) {
        // 通知父组件选中的项目
        emit('select', selectedProject.value);
        closeDialog();
    } else {
        // 可以添加提示，让用户先选择一个项目
        console.warn("请先选择一个项目");
    }
};

// 关闭选择对话框
const closeDialog = () => {
    visible.value = false;
    selectedProject.value = null;
};

// 关闭添加对话框
const closeAddDialog = () => {
    addVisible.value = false;
    newProjectName.value = '';
};

// 监听visible变化
watch(
    () => props.visible,
    (newValue) => {
        if (newValue) {
            // 清空选择
            selectedProject.value = null;
            // 重新加载项目列表
            loadProjects();
        }
    }
);

// 监听addVisible变化
watch(
    () => props.addVisible,
    (newValue) => {
        if (newValue) {
            // 清空输入框
            newProjectName.value = '';
            // 自动聚焦到输入框
            nextTick(() => {
                const input = document.querySelector('input[placeholder="请输入项目名"]');
                if (input) {
                    (input as HTMLInputElement).focus();
                }
            });
        }
    }
);
</script>

<style scoped>
/* 可以添加一些样式优化 */
:deep(.p-dialog-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 0 0;
}

:deep(.p-listbox-item) {
    padding: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

:deep(.p-listbox-item:hover) {
    background-color: #f8f9fa;
}

:deep(.p-listbox-item.p-highlight) {
    background-color: #e9ecef;
    color: #495057;
}
</style>