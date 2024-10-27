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

			// Define price ranges in intervals of $1
			const priceRanges = [
				{ label: "$0-1", min: 0, max: 1 },
				{ label: "$1-2", min: 1, max: 2 },
				{ label: "$2-3", min: 2, max: 3 },
				{ label: "$3-4", min: 3, max: 4 },
				{ label: "$4-5", min: 4, max: 5 },
				// Add more ranges as needed
				{ label: "$9-10", min: 9, max: 10 },
				{ label: "Above $10", min: 10, max: Infinity },
			];

			// Initialize the buckets with zero profit
			const buckets = {};
			priceRanges.forEach((range) => {
				buckets[range.label] = 0; // Start each bucket with 0 profit
			});

			// Aggregate profit for each trade within its price range using `buyPrice`
			this.trades.forEach((trade) => {
				const buyPrice = trade.buyPrice;
				const profitLoss = trade.profitLoss;
				const bucket = priceRanges.find((range) => buyPrice >= range.min && buyPrice < range.max);
				if (bucket) {
					buckets[bucket.label] += profitLoss; // Sum profits/losses within each price range
				}
			});

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
				grid: { top: 80, bottom: 30 },
				xAxis: {
					type: "value",
					position: "top",
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
