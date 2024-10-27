<!-- ./src/components/partials/charts/ProfitLossHistogram.vue -->
<template>
	<div class="profit-loss-histogram">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip">?
				<div v-if="isTooltipVisible" class="tooltip-text">
					The frequency of different levels of profit or loss. You can see if most of your trades are hovering around a small profit, a large profit, or are consistently unprofitable. This helps in assessing your overall trading strategy's risk/reward profile.
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
	props: {
		trades: {
			type: Array,
			required: true,
		},
		granularity: {
			type: String,
			default: "daily", // Options: 'hourly', 'daily', 'weekly', 'monthly', 'yearly'
		},
	},
	components: {
		VChart,
	},
	data() {
		return {
			isTooltipVisible: false,
		};
	},
	methods: {
		showTooltip() {
			this.isTooltipVisible = true;
		},
		hideTooltip() {
			this.isTooltipVisible = false;
		},
		formatDate(date) {
			const d = new Date(date);
			switch (this.granularity) {
				case "hourly":
					return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`; // Show only time
				case "daily":
					return d.toLocaleDateString();
				case "weekly":
					const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
					return `${weekStart.toLocaleDateString()} (Week)`;
				case "monthly":
					return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
				case "yearly":
					return d.getFullYear().toString();
				default:
					return d.toLocaleDateString();
			}
		},
	},
	computed: {
		chartOptions() {
			return {
				title: {
					text: "Profit/Loss Distribution",
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "shadow",
					},
					formatter: (params) => {
						const value = Math.abs(params[0].value).toFixed(2);
						return `${params[0].name}: ${value}`;
					},
				},
				grid: {
					top: 80,
					bottom: 30,
				},
				xAxis: {
					type: "value",
					position: "top",
					splitLine: {
						lineStyle: {
							type: "dashed",
						},
					},
					name: "Number of Trades",
				},
				yAxis: {
					type: "category",
					axisLine: { show: false },
					axisLabel: { show: true },
					axisTick: { show: false },
					splitLine: { show: false },
					data: this.labels,
					name: "Profit/Loss Range",
				},
				series: [
					{
						name: "Number of Trades",
						type: "bar",
						data: this.data.map((value, index) => {
							const isLoss = this.labels[index].includes("-");
							const adjustedValue = isLoss ? -Math.abs(value) : value;

							return {
								value: parseFloat(adjustedValue.toFixed(2)),
								label: {
									show: false,
									position: isLoss ? "left" : "right",
									formatter: "{c}",
								},
								itemStyle: {
									color: isLoss ? "#e57373" : "#91cc75", // Red for negative buckets, blue for positive
								},
							};
						}),
					},
				],
			};
		},
	},
};
</script>

<style scoped>
.profit-loss-histogram {
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
