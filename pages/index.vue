<template>
  <div class="collaborative-editor">
    <Tip />
  </div>
  <div class="collaborative-second">
    <Video />
  </div>
  <div class="collaborative-third">
    <h1>项目数据</h1>
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
    <Fieldset legend="Header">
      <p class="m-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
        exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
        irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.
      </p>
    </Fieldset>
  </div>
  <div class="collaborative-seventh">
    <div>
      <!-- 页面占位 -->
      <div>
        <div>
          <Panel header="Header"> xxxxxxxxxxxxxx </Panel>
        </div>
      </div>
    </div>
    <sixth />
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
        label: "pv",
        fill: false,
        borderColor: documentStyle.getPropertyValue("--p-cyan-500"),
        yAxisID: "y",
        tension: 0.4,
        data: [65, 59, 80, 81, 56, 55, 10],
      },
      {
        label: "uv",
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
</style>
