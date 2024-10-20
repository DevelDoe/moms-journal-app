<template>
    <div id="app">
      <h1>Test ECharts</h1>
      <v-chart :option="chartOptions" autoresize style="height: 400px; width: 100%"></v-chart>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: "App",
    setup() {
      const chartOptions = ref({
        title: {
          text: 'Sample Chart',
          left: 'center'
        },
        xAxis: {
          type: 'category',
          data: ['A', 'B', 'C', 'D']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [10, 20, 30, 40],
            type: 'bar'
          }
        ]
      });
  
      return {
        chartOptions
      };
    }
  };
  </script>
  