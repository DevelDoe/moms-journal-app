<template>
	<div id="cumulative-profit-chart">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip">
				?
				<div v-if="isTooltipVisible" class="tooltip-text">
					This chart will allow you to see how your profit is growing (or shrinking) and the number of trades over a given time period, showing you
					periods of consistent growth, major drawdowns, and trading frequency compared to profits and losses.
				</div>
			</span>
		</div>
		<v-chart :option="chartOptions" autoresize style="width: 100%; height: 400px"></v-chart>
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
					text: `Profit & Number of Trades (${this.granularity})`,
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
					axisPointer: {
						type: "line",
					},
				},
				legend: {
					orient: "horizontal",
					left: "center",
					top: "0%",
					textStyle: { color: "#333" },
					icon: "circle",
				},
				grid: {
					left: "5%",
					right: "5%",
					bottom: "5%",
					top: "10%",
					containLabel: false,
				},
				xAxis: {
					type: "category",
					data: this.cumulativeProfitData.labels,
					axisLine: {
						lineStyle: { color: "#1E3E62" }, // Color of the x-axis line
					},
					axisLabel: {
						color: "#1E3E62", // Color of the x-axis labels
						fontSize: 14, // Size of the font for the labels
					},
					splitLine: {
						lineStyle: {
							color: "#1E3E62", // Change this to your preferred color for the horizontal lines
							width: 1, // Thickness of the lines
							type: "solid", // Options: 'solid', 'dashed', 'dotted'
						},
					},
				},
				yAxis: [
					{
						type: "value",
						name: "Cumulative Profit",
						position: "left",
						axisLine: {
							lineStyle: { color: "#1E3E62" },
						},
						axisLabel: {
							color: "#1E3E62",
							fontSize: 16,
						},
						splitLine: {
							lineStyle: {
								color: "#1E3E62", // Ensure the same color for consistency
								width: 1,
								type: "solid",
							},
						},
					},
					{
						type: "value",
						name: "Number of Trades",
						position: "right",
						axisLine: {
							lineStyle: { color: "#1E3E62" },
						},
						axisLabel: {
							color: "#1E3E62",
							fontSize: 16,
						},
						splitLine: {
							lineStyle: {
								color: "#1E3E62", // Ensure the same color for consistency
								width: 1,
								type: "solid",
							},
						},
					},
				],
				series: [
					{
						name: "Cumulative Profit",
						type: "line",
						data: this.cumulativeProfitData.profitData.map((value) => parseFloat(value.toFixed(2))),
						itemStyle: { color: "#e57373" },
						smooth: true,
						lineStyle: { width: 3 },
					},
					{
						name: "Number of Trades",
						type: "line",
						data: this.cumulativeProfitData.tradeCountData,
						yAxisIndex: 1,
						itemStyle: { color: "#5470C6" },
						smooth: true,
						lineStyle: { width: 3 },
					},
				],
				animationDuration: 5000, // Set animation duration in milliseconds
			};
		},
	},
};
</script>

<style scoped>
#cumulative-profit-chart {
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
