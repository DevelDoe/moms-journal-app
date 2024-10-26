script
<!-- ./src/components/partials/charts/DailyTradesProfitChart.vue -->
<template>
	<div class="daily-trades-profit-chart">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip"
				>?
				<div v-if="isTooltipVisible" class="tooltip-text">This chart allows you to compare the number of trades you made with the profit or loss.</div>
			</span>
		</div>
		<v-chart :option="chartOptions" autoresize style="width: 100%; height: 400px"></v-chart>
	</div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent]);

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
		tradeProfitAndTradeCountData() {
			if (!this.trades || this.trades.length === 0) {
				return { labels: [], profitData: [], tradeCountData: [] };
			}

			const labels = [];
			const profitData = [];
			const tradeCountData = [];

			// Sort trades by date
			const sortedTrades = [...this.trades].sort((a, b) => new Date(a.date) - new Date(b.date));

			// Group trades based on selected granularity (e.g., daily, weekly)
			const groupedTrades = sortedTrades.reduce((acc, trade) => {
				const key = this.formatDate(trade.date); // Format date based on granularity (e.g., daily, weekly)
				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key].push(trade);
				return acc;
			}, {});

			// For each group (e.g., each day), calculate the total profit and count of trades
			Object.keys(groupedTrades).forEach((group) => {
				const trades = groupedTrades[group];
				labels.push(group);

				// Calculate total profit for the group (e.g., a day)
				const totalProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
				profitData.push(totalProfit); // Use total profit per day

				// Count of trades in this group (e.g., day)
				tradeCountData.push(trades.length);
			});

			return {
				labels,
				profitData,
				tradeCountData,
			};
		},
		chartOptions() {
			const { labels, profitData, tradeCountData } = this.tradeProfitAndTradeCountData;

			if (!labels || labels.length === 0) {
				return {}; // Prevent rendering if there's no data
			}

			return {
				title: {
					text: `Trades & Profits (${this.granularity})`,
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
				legend: {
					orient: "horizontal",
					left: "center",
					top: "0%",
					textStyle: { color: "#eaeaea" },
					icon: "circle",
				},
				grid: {
					left: "1%", // Add some padding on both sides for centering
					right: "1%",
					bottom: "1%",
					containLabel: true,
				},
				xAxis: {
					type: "value",
					position: "center", // This keeps the axis at the center
					min: -Math.max(...profitData, ...tradeCountData) * 1.1, // Dynamically calculate min and max based on data
					max: Math.max(...profitData, ...tradeCountData) * 1.1,
					axisLine: {
						lineStyle: { color: "#1E3E62" }, // Color of the x-axis line
					},
					axisLabel: {
						color: "#1E3E62", // Color of the x-axis labels
						fontSize: 10, // Size of the font for the labels
					},
					splitLine: {
						lineStyle: {
							color: "#1E3E62", // Change this to your preferred color for the horizontal lines
							width: 1, // Thickness of the lines
							type: "solid", // Options: 'solid', 'dashed', 'dotted'
						},
					},
				},
				yAxis: {
					ype: "category", // This sets the axis to categorical mode, allowing for labeled points
					data: labels, // Custom labels (e.g., dates, categories) provided by `labels` array
					axisLine: { show: false }, // Hide axis line if desired
					axisLabel: { color: "#1E3E62",fontSize: 16,}, // Set axis label color
					axisTick: { show: false }, // Hide ticks if desired
					splitLine: { show: false }, // Hide grid lines if desired
				},
				series: [
					{
						name: "Number of Trades",
						type: "bar",
						stack: "Total",
						data: tradeCountData.map((value) => ({
							value: parseFloat(value).toFixed(2),
							itemStyle: { color: value >= 0 ? "#5470C6" : "#e57373" },
						})),
					},
					{
						name: "Profit/Loss",
						type: "bar",
						stack: "Total",
						label: {
							show: false,
							position: "right",
							formatter: (params) => parseFloat(params.value).toFixed(2),
						},
						data: profitData.map((value) => ({
							value: parseFloat(value).toFixed(2),
							itemStyle: { color: value >= 0 ? "#A7C957" : "#e57373" },
						})),
					},
				],
				animationDuration: 3000,
				animationEasing: "sinusoidalIn",
			};
		},
	},
};
</script>

<style scoped>
.daily-trades-profit-chart {
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
