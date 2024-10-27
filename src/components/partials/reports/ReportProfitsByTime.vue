<template>
	<div class="trades-by-hour-chart">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip"
				>?
				<div v-if="isTooltipVisible" class="tooltip-text">
					This chart shows the profit and loss of trades aggregated by the minute. Each bar represents the profit or loss made during a specific
					minute of the day, allowing you to identify profitable and non-profitable times.
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
		tradesByHour() {
			if (this.filteredTrades.length === 0) {
				return { minHour: 0, maxHour: 23, tradesByHour: Array(24).fill(0) }; // Default if no trades
			}

			let minHour = 23;
			let maxHour = 0;
			const tradesByHour = Array(24).fill(0); // Initialize 24-hour slots

			// Aggregate trades by hour and find min and max hours with activity
			this.filteredTrades.forEach((trade) => {
				if (trade && trade.date && trade.profitLoss !== undefined) {
					const tradeHour = new Date(trade.date).getHours();
					tradesByHour[tradeHour] += trade.profitLoss;

					if (tradeHour < minHour) minHour = tradeHour;
					if (tradeHour > maxHour) maxHour = tradeHour;
				}
			});

			return { minHour, maxHour, tradesByHour };
		},
		// Format trades by hour chart data for active hours only
		tradesByHourChartData() {
			const { minHour, maxHour, tradesByHour } = this.tradesByHour;

			// Extract only active hours and their corresponding data
			return {
				labels: Array.from({ length: maxHour - minHour + 1 }, (_, i) => `${i + minHour}:00`),
				data: tradesByHour.slice(minHour, maxHour + 1),
			};
		},
		// Calculate trades by minute for a detailed view
		tradesByMinute() {
			if (this.filteredTrades.length === 0) {
				return { minMinute: 0, maxMinute: 1439, tradesByMinute: Array(1440).fill(0) }; // Default to full day if no trades
			}

			let minMinute = 1439;
			let maxMinute = 0;
			const tradesByMinute = Array(1440).fill(0); // Initialize array for 1440 minutes

			// Aggregate trades by minute and determine min and max minute with activity
			this.filteredTrades.forEach((trade) => {
				if (trade && trade.date && trade.profitLoss !== undefined) {
					const date = new Date(trade.date);
					const tradeMinute = date.getHours() * 60 + date.getMinutes(); // Convert to minutes from start of day
					tradesByMinute[tradeMinute] += trade.profitLoss;

					if (tradeMinute < minMinute) minMinute = tradeMinute;
					if (tradeMinute > maxMinute) maxMinute = tradeMinute;
				}
			});

			return { minMinute, maxMinute, tradesByMinute };
		},
		// Format the data to be used in the chart, only for active minute range
		tradesByMinuteChartData() {
			const { minMinute, maxMinute, tradesByMinute } = this.tradesByMinute;

			// Extract only active minutes and their corresponding data
			return {
				labels: Array.from({ length: maxMinute - minMinute + 1 }, (_, i) => {
					const totalMinutes = i + minMinute;
					const hours = Math.floor(totalMinutes / 60)
						.toString()
						.padStart(2, "0");
					const minutes = (totalMinutes % 60).toString().padStart(2, "0");
					return `${hours}:${minutes}`;
				}),
				data: tradesByMinute.slice(minMinute, maxMinute + 1),
			};
		},
		chartOptions() {
			return {
				title: {
					text: "Trades by Hour",
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "shadow",
					},
				},
				xAxis: {
					type: "category",
					data: this.labels, // Use labels for active hours
				},
				yAxis: {
					type: "value",
					name: "Profit/Loss",
				},
				series: [
					{
						name: "Profit/Loss",
						type: "bar",
						data: this.data, // Use P/L data for active hours
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
.trades-by-hour-chart {
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
