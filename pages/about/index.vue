<template>
    <div class="container w-full h-full bg-gray-50">
        <div class="bg-white w-full min-h-screen">
            <!-- 主要内容区域 -->
            <div class="w-full">
                <!-- 公司简介 -->
                <div class="items-center w-full mb-10">
                    <div class="aspect-w-16 bg-white rounded-lg flex items-center justify-center">
                        <span class="text-gray-500 text-lg">
                            <img src="https://s2.loli.net/2025/11/15/fQ5bv8o2cxuC9da.jpg" alt="公司简介"
                                class="w-full"></img>
                        </span>
                    </div>
                </div>

                <!-- 核心价值观 -->
                <div class="mb-20">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div
                                class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z">
                                    </path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-3">创新驱动</h3>
                            <p class="text-gray-600">不断探索新技术，推动行业进步，为客户创造更大价值。</p>
                        </div>

                        <div class="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div
                                class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                                    </path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-3">专业可靠</h3>
                            <p class="text-gray-600">严格的质量标准，专业的服务团队，确保每一个项目的成功交付。</p>
                        </div>

                        <div class="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div
                                class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                                    </path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-3">客户至上</h3>
                            <p class="text-gray-600">深入了解客户需求，提供个性化解决方案，建立长期合作关系。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "about" as any,
});

useSeoMeta({
    title: '关于我们 - 了解我们的团队和理念',
    description: '了解我们的公司文化、团队成员和核心价值观，探索我们如何通过创新技术为客户创造价值。',
})
</script>

<style scoped>
.container {
    font-family: 'Inter', sans-serif;
    width: 100vw;
}

.aspect-w-16 {
    position: relative;
}

.aspect-w-16::before {
    content: '';
    display: block;
    padding-bottom: 56.25%;
    /* 16:9 aspect ratio */
}
</style>