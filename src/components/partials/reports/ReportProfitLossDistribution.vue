<!-- ./src/components/partials/reports/ReportProfitLossDistribution.vue -->
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
		labels: {
			type: Array,
			required: true,
		},
		data: {
			type: Array,
			required: true,
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
	},
	computed: {
		profitLossDistributionData() {
			if (!this.filteredTrades || this.filteredTrades.length === 0) return { labels: [], data: [] };

			const bucketRanges = [
				{ label: "Below -$987", min: -Infinity, max: -987 },
				{ label: "-$987 to -$610", min: -987, max: -610 },
				// ... other bucket ranges here
				{ label: "Above $987", min: 987, max: Infinity },
			];

			const distribution = bucketRanges.reduce((acc, range) => {
				acc[range.label] = 0;
				return acc;
			}, {});

			this.filteredTrades.forEach((trade) => {
				const profitLoss = trade?.profitLoss;
				if (profitLoss !== undefined) {
					const bucket = bucketRanges.find((range) => profitLoss >= range.min && profitLoss < range.max);
					if (bucket) distribution[bucket.label]++;
				}
			});

			return {
				labels: Object.keys(distribution),
				data: Object.values(distribution),
			};
		},
		chartOptions() {
			return {
				title: {
					text: "Profit/Loss Distribution",
				},
				tooltip: {
					trigger: "axis",
					axisPointer: { type: "shadow" },
					formatter: (params) => `${params[0].name}: ${Math.abs(params[0].value).toFixed(2)}`,
				},
				grid: { top: 80, bottom: 30 },
				xAxis: {
					type: "value",
					position: "top",
					splitLine: { lineStyle: { type: "dashed" } },
					name: "Number of Trades",
				},
				yAxis: {
					type: "category",
					data: this.profitLossDistributionData.labels,
					name: "Profit/Loss Range",
				},
				series: [
					{
						name: "Number of Trades",
						type: "bar",
						data: this.profitLossDistributionData.data.map((value, index) => ({
							value: Math.sign(value) === -1 ? -Math.abs(value) : value,
							label: { show: false },
							itemStyle: { color: value < 0 ? "#e57373" : "#91cc75" },
						})),
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
