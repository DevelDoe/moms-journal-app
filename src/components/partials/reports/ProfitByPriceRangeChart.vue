<!-- ./src/components/partials/charts/ProfitByPriceRangeChart.vue -->
<template>
	<div class="profit-by-price-range-chart">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip"
				>?
				<div v-if="isTooltipVisible" class="tooltip-text">
					This chart shows the profit and loss for different prices. Each bar represents the price of a stock with profit or
					loss range, helping you understand which price brackets are most profitable in your trading activity.
				</div>
			</span>

			<v-chart :option="chartOptions" autoresize style="width: 100%; height: 400px"></v-chart>
		</div>
	</div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent]);

export default {
  data() {
		return {
			isTooltipVisible: false,
		};
	},
	props: {
		labels: {
			type: Array,
			required: true,
		},
		data: {
			type: Array,
			required: true,
			isTooltipVisible: false,
		},
	},
	components: {
		VChart,
	},
	methods: {
		showTooltip() {
			this.isTooltipVisible = true;
		},
		hideTooltip() {
			this.isTooltipVisible = false;
		},
	},
	computed: {
		chartOptions() {
			return {
				title: {
					text: "Profit by Price Range",
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "shadow",
					},
				},
				xAxis: {
					type: "category",
					data: this.labels, // Price ranges as labels
				},
				yAxis: {
					type: "value",
					name: "Profit/Loss",
				},
				series: [
					{
						name: "Profit/Loss",
						type: "bar",
						data: this.data,
						itemStyle: {
							color: (params) => (params.value >= 0 ? "#91cc75" : "#e57373"), // Positive: blue, Negative: red
						},
					},
				],
			};
		},
	},
};
</script>

<style scoped>
.profit-by-price-range-chart {
	margin-top: 20px;
}

.chart-header {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
	position: relative;
	padding-left: 20px;
}

.tooltip-icon {
	position: absolute;
	top: 0px;
	right: 0px;
	display: inline-block;
	background: #007bff;
	color: #fff;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	text-align: center;
	cursor: pointer;
	font-size: 14px;
	line-height: 18px;
	z-index: 999;
}

.tooltip-text {
	position: absolute;
	top: 25px;
	right: 0;
	background-color: #333;
	color: #fff;
	padding: 5px;
	border-radius: 4px;
	width: 200px;
	font-size: 12px;
	z-index: 10;
	opacity: 0.9;
	box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
	white-space: normal;
	transition: opacity 0.3s ease-in-out;
}
</style>
