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
		profitLossDistribution() {
			if (this.filteredTrades.length === 0) {
				return {}; // No trades, no distribution data
			}

			// Define the specific bucket ranges to cover both losses and profits using expanded Fibonacci numbers
			const bucketRanges = [
				{ label: "Below -$987", min: -Infinity, max: -987 },
				{ label: "-$987 to -$610", min: -987, max: -610 },
				{ label: "-$610 to -$377", min: -610, max: -377 },
				{ label: "-$377 to -$233", min: -377, max: -233 },
				{ label: "-$233 to -$144", min: -233, max: -144 },
				{ label: "-$144 to -$89", min: -144, max: -89 },
				{ label: "-$89 to -$55", min: -89, max: -55 },
				{ label: "-$55 to -$34", min: -55, max: -34 },
				{ label: "-$34 to -$21", min: -34, max: -21 },
				{ label: "-$21 to -$13", min: -21, max: -13 },
				{ label: "-$13 to -$8", min: -13, max: -8 },
				{ label: "-$8 to -$5", min: -8, max: -5 },
				{ label: "-$5 to -$3", min: -5, max: -3 },
				{ label: "-$3 to -$2", min: -3, max: -2 },
				{ label: "-$2 to $0", min: -2, max: 0 },
				{ label: "$0 to $2", min: 0, max: 2 },
				{ label: "$2 to $3", min: 2, max: 3 },
				{ label: "$3 to $5", min: 3, max: 5 },
				{ label: "$5 to $8", min: 5, max: 8 },
				{ label: "$8 to $13", min: 8, max: 13 },
				{ label: "$13 to $21", min: 13, max: 21 },
				{ label: "$21 to $34", min: 21, max: 34 },
				{ label: "$34 to $55", min: 34, max: 55 },
				{ label: "$55 to $89", min: 55, max: 89 },
				{ label: "$89 to $144", min: 89, max: 144 },
				{ label: "$144 to $233", min: 144, max: 233 },
				{ label: "$233 to $377", min: 233, max: 377 },
				{ label: "$377 to $610", min: 377, max: 610 },
				{ label: "$610 to $987", min: 610, max: 987 },
				{ label: "Above $987", min: 987, max: Infinity },
			];

			// Initialize the buckets
			const buckets = {};
			bucketRanges.forEach((range) => {
				buckets[range.label] = 0; // Start each bucket with a count of 0
			});

			// Count the trades in each bucket
			this.filteredTrades.forEach((trade) => {
				if (trade && trade.profitLoss !== undefined) {
					const profitLoss = trade.profitLoss;
					// Find the correct bucket for each trade
					const bucket = bucketRanges.find((range) => profitLoss >= range.min && profitLoss < range.max);
					if (bucket) {
						buckets[bucket.label]++;
					}
				}
			});

			return buckets;
		},
		profitLossDistributionChartData() {
			const distribution = this.profitLossDistribution;
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
