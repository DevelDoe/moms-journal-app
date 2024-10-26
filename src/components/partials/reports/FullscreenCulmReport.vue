<template>
	<div class="fullscreen-chart" v-if="isVisible">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip">
				?
				<div v-if="isTooltipVisible" class="tooltip-text">
					This chart will allow you to see how your profit is growing (or shrinking) and the number of trades over a given time period, showing you
					periods of consistent growth, major drawdowns, and trading frequency compared to profits and losses.
				</div>
			</span>
			<button class="close-btn" @click="closeFullScreen">Close Chart</button>
		</div>
		<v-chart :option="chartOptions" autoresize style="width: 100%; height: 100%"></v-chart>
	</div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent]);

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
			isVisible: true, // Track visibility of the chart
		};
	},
	methods: {
		showTooltip() {
			this.isTooltipVisible = true;
		},
		hideTooltip() {
			this.isTooltipVisible = false;
		},
		closeFullScreen() {
			this.isVisible = false; // Close the full-screen chart
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
		cumulativeProfitData() {
			if (!this.trades || this.trades.length === 0) {
				return { labels: [], profitData: [], tradeCountData: [] };
			}

			let cumulativeProfit = 0;
			let cumulativeTradeCount = 0;
			const labels = [];
			const profitData = [];
			const tradeCountData = [];

			const sortedTrades = [...this.trades].sort((a, b) => new Date(a.date) - new Date(b.date));

			// Group trades based on selected granularity
			const groupedTrades = sortedTrades.reduce((acc, trade) => {
				const key = this.formatDate(trade.date);
				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key].push(trade);
				return acc;
			}, {});

			// Calculate cumulative profit and trade count for each group
			Object.keys(groupedTrades).forEach((group) => {
				const trades = groupedTrades[group];
				labels.push(group);

				trades.forEach((trade) => {
					cumulativeProfit += trade.profitLoss;
				});
				profitData.push(cumulativeProfit);

				cumulativeTradeCount += trades.length;
				tradeCountData.push(cumulativeTradeCount);
			});

			return {
				labels,
				profitData,
				tradeCountData,
			};
		},
		chartOptions() {
			return {
				title: {
					text: ``,
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "line",
					},
				},
				xAxis: {
					type: "category",
					data: this.cumulativeProfitData.labels,
				},
				yAxis: [
					{
						type: "value",
						name: "Cumulative Profit",
						position: "left",
					},
					{
						type: "value",
						name: "Number of Trades",
						position: "right",
					},
				],
				series: [
					{
						name: "Cumulative Profit",
						type: "line",
						data: this.cumulativeProfitData.profitData.map((value) => parseFloat(value.toFixed(2))),
						itemStyle: { color: "#e57373" },
						smooth: false,
					},
					{
						name: "Number of Trades",
						type: "line",
						data: this.cumulativeProfitData.tradeCountData,
						yAxisIndex: 1,
						itemStyle: { color: "#5470C6" },
						smooth: true,
					},
				],
				animationDuration: 5000, // Set animation duration in milliseconds
			};
		},
	},
};
</script>

<style scoped>
.fullscreen-chart {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: white;
	z-index: 1000;
	padding: 20px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
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

.close-btn {
	position: absolute;
	top: 10px;
	right: 20px;
	background-color: red;
	color: white;
	border: none;
	padding: 10px 20px;
	cursor: pointer;
    z-index: 9999;
}
</style>
