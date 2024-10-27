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
	},
	computed: {
		profitByPriceRange() {
		if (this.trades.length === 0) return { labels: [], data: [] };

		// Extract unique dollar-based bucket values from `buyPrice`
		const uniqueBuckets = [
			...new Set(this.trades.map(trade => Math.floor(trade.buyPrice))),
		].sort((a, b) => a - b); // Sort in ascending order

		// Initialize buckets with zero profit for each unique dollar value
		const buckets = uniqueBuckets.reduce((acc, dollar) => {
			acc[`$${dollar}-${dollar + 1}`] = 0;
			return acc;
		}, {});

		// Aggregate profit for each trade within its dollar range
		this.trades.forEach((trade) => {
			const dollarBucket = `$${Math.floor(trade.buyPrice)}-${Math.floor(trade.buyPrice) + 1}`;
			buckets[dollarBucket] += trade.profitLoss;
		});

		// Prepare labels and data arrays for the chart
		return {
			labels: Object.keys(buckets),
			data: Object.values(buckets),
		};
	},
		chartOptions() {
			return {
				title: {
					text: `Profit by Stock Price Range (${this.granularity})`,
					left: "left", // Position the title in the center
					textStyle: {
						color: "#ffffff", // Title text color
						fontSize: 18, // Font size
						fontWeight: "bold", // Font weight: 'normal', 'bold', 'bolder', 'lighter'
					},
					subtext: "", // Add a subtitle if needed
					subtextStyle: {
						color: "#aaa", // Subtitle color
						fontSize: 14,
					},
				},
				tooltip: {
					trigger: "axis",
					axisPointer: { type: "shadow" },
				},
				grid: {
					left: "0%", // Add some padding on both sides for centering
					right: "0%",
					bottom: "0%",
					containLabel: true,
				},
				xAxis: {
					type: "value",
					position: "center",
					splitLine: { lineStyle: { type: "dashed" } },
					name: "Total Profit/Loss",
				},
				yAxis: {
					type: "category",
					data: this.profitByPriceRange.labels,
					name: "Stock Price Range",
				},
				series: [
					{
						name: "Profit/Loss",
						type: "bar",
						data: this.profitByPriceRange.data.map((value) => ({
							value: parseFloat(value.toFixed(2)),
							itemStyle: {
								color: value < 0 ? "#e57373" : "#91cc75",
							},
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
