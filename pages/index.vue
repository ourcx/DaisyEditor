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
    <Animation />
  </div>
  <div class="collaborative-fifth">
    <h1>占位置的</h1>
    <br />
    <br />
    <br />
  </div>
</template>

<script setup lang="ts">
import Tip from "~/components/home/tip.vue";
// 这里可以添加组件逻辑
import Video from "~/components/home/Video.vue";
import Animation from "~/components/home/Animation.vue";
import Chart from "primevue/chart";

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
</style>
