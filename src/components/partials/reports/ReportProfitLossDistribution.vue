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

		// Calculate min and max buyPrice
		const prices = this.trades.map(trade => trade.buyPrice);
		const minPrice = Math.min(...prices);
		const maxPrice = Math.max(...prices);

		// Define number of buckets and calculate interval size
		const bucketCount = 10; // Number of dynamic intervals
		const intervalSize = (maxPrice - minPrice) / bucketCount;

		// Create dynamic bucket ranges
		const buckets = Array.from({ length: bucketCount }, (_, i) => {
			const min = minPrice + i * intervalSize;
			const max = min + intervalSize;
			return {
				label: `$${min.toFixed(2)} - $${max.toFixed(2)}`,
				min,
				max,
				totalProfit: 0, // Initialize profit for each bucket
			};
		});

		// Aggregate profit for each trade within its price range
		this.trades.forEach((trade) => {
			const profitLoss = trade.profitLoss;
			const bucket = buckets.find((range) => trade.buyPrice >= range.min && trade.buyPrice < range.max);
			if (bucket) {
				bucket.totalProfit += profitLoss; // Sum profits/losses within each price range
			}
		});

		// Prepare labels and data arrays for the chart
		return {
			labels: buckets.map(bucket => bucket.label),
			data: buckets.map(bucket => bucket.totalProfit),
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
