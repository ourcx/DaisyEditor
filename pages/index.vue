<template>
  <div class="collaborative-editor">
    <Tip />
  </div>
  <div class="collaborative-second">
    <Video />
  </div>
  <div class="collaborative-third">
    <h1>项目数据统计</h1>
    <Chart
      type="line"
      :data="chartData"
      :options="chartOptions"
      :width="1000"
      :height="500"
    />
  </div>
  <div class="collaborative-fourth">
    <Panel />
  </div>
  <div class="collaborative-fifth">
    <Animation />
  </div>
  <div class="collaborative-sixth">
    <sixth />
    <Fieldset legend="项目介绍">
      <p class="m-0">
        Daisy协作编辑平台是一个创新的在线协作工具，旨在帮助团队成员高效地协同编辑文档。
        它提供了实时协作、版本控制和评论功能，使团队协作更加流畅。无论您身在何处，都能与团队保持同步，
        共同创作出卓越的文档。我们的平台支持多种文件格式，包括文档、表格和演示文稿，满足您不同的工作需求。
      </p>
    </Fieldset>
  </div>
  <div class="collaborative-seventh">
    <div>
      <!-- 功能特性展示 -->
      <div>
        <div>
          <Panel header="核心功能">
            <p>实时协作编辑 | 版本历史管理 | 多格式支持 | 智能评论系统 | 权限管理</p>
            <p>
              Daisy协作编辑器让团队协作变得更加简单高效，支持多人同时在线编辑，实时同步更改，
              确保每个团队成员都能及时了解项目进展。
            </p>
          </Panel>
        </div>
      </div>
    </div>
    <sixth />
  </div>
  <div class="collaborative-eighth">
    <Text />
  </div>
</template>

<script setup lang="ts">
import Tip from "~/components/home/tip.vue";
// 这里可以添加组件逻辑
import Video from "~/components/home/Video.vue";
import Animation from "~/components/home/Animation.vue";
import Chart from "primevue/chart";
import Panel from "~/components/home/Panel.vue";
import sixth from "~/components/home/ImageFei.vue";
import Text from "~/components/home/Text.vue";
onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);

  return {
    labels: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
    datasets: [
      {
        label: "页面浏览量",
        fill: false,
        borderColor: documentStyle.getPropertyValue("--p-cyan-500"),
        yAxisID: "y",
        tension: 0.4,
        data: [65, 59, 80, 81, 56, 55, 10],
      },
      {
        label: "独立访客",
        fill: false,
        borderColor: documentStyle.getPropertyValue("--p-gray-500"),
        yAxisID: "y1",
        tension: 0.4,
        data: [28, 48, 40, 19, 86, 27, 90],
      },
    ],
  };
};
const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--p-text-color");
  const textColorSecondary = documentStyle.getPropertyValue("--p-text-muted-color");
  const surfaceBorder = documentStyle.getPropertyValue("--p-content-border-color");

  return {
    stacked: false,
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          drawOnChartArea: false,
          color: surfaceBorder,
        },
      },
    },
  };
};
</script>

<style scoped lang="scss">
.collaborative-editor {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.collaborative-third {
  background-color: var(--fei-bg-color);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100vh;
}

.collaborative-fourth {
  background-color: var(--fei-bg-color);
}

.collaborative-sixth {
  padding: 2rem;
  background-color: var(--fei-color-success-light-3);
  width: 100%;
  height: 60vh;
  display: flex;
  align-items: center;
}

.collaborative-seventh {
  padding: 2rem;
  background-color: var(--fei-color-primary-light-3);
  width: 100%;
  height: 60vh;
  display: flex;
  align-items: center;
}

.collaborative-eighth {
  padding: 2rem;
  width: 100%;
  height: 60vh;
  display: flex;
  align-items: center;
}
</style>
