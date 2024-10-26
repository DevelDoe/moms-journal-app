<!-- ./src/components/partials/charts/DailyTradesProfitChart.vue -->
<template>
	<div class="daily-trades-profit-chart">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip"
				>?
				<div v-if="isTooltipVisible" class="tooltip-text">
					This chart allows you to compare the number of trades you made with the profit or loss.
				</div>
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
			if (this.filteredTrades.length === 0) {
				return { labels: [], profitData: [], tradeCountData: [] }; // No trades available
			}

			// Sort the trades by date
			const sortedTrades = [...this.filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date));

			const isSingleDay = this.filterDate !== ""; // Determine if filtering to a specific day

			const labels = [];
			const profitData = [];
			const tradeCountData = [];

			if (isSingleDay) {
				// Group trades by hour for the filtered day
				const tradesByHour = sortedTrades.reduce((acc, trade) => {
					const date = new Date(trade.date);
					const hourKey = `${date.getHours()}:00`; // e.g., '14:00'
					if (!acc[hourKey]) {
						acc[hourKey] = [];
					}
					acc[hourKey].push(trade);
					return acc;
				}, {});

				// Prepare labels and data for the chart
				Object.keys(tradesByHour).forEach((hour) => {
					const trades = tradesByHour[hour];
					labels.push(hour);

					// Calculate total profit for the hour
					const hourlyProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
					profitData.push(hourlyProfit);

					// Number of trades in this hour
					tradeCountData.push(trades.length);
				});
			} else {
				// Group trades by day
				const tradesByDay = sortedTrades.reduce((acc, trade) => {
					const dateKey = new Date(trade.date).toLocaleDateString();
					if (!acc[dateKey]) {
						acc[dateKey] = [];
					}
					acc[dateKey].push(trade);
					return acc;
				}, {});

				// Prepare labels and data for the chart
				Object.keys(tradesByDay).forEach((date) => {
					const trades = tradesByDay[date];
					labels.push(date);

					// Calculate total profit for the day
					const tradeProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
					profitData.push(tradeProfit);

					// Number of trades on this day
					tradeCountData.push(trades.length);
				});
			}

			return {
				labels,
				profitData,
				tradeCountData,
			};
		},
		chartOptions() {
			return {
				title: {
					text: "Trades vs Profit/Loss",
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "shadow",
					},
					formatter: (params) => {
						return params.map(param => {
							return `${param.seriesName}: ${parseFloat(param.value).toFixed(2)}`;
						}).join('<br/>');
					},
				},
				legend: {
					data: ["Number of Trades", "Profit/Loss"],
				},
				grid: {
					left: "5%",
					right: "5%",
					bottom: "5%",
					containLabel: false,
				},
				xAxis: {
					type: "value",
					position: "top",
					splitLine: {
						lineStyle: {
							type: "dashed",
						},
					},
				},
				yAxis: {
					type: "category",
					axisLine: { show: false },
					axisLabel: { show: true },
					axisTick: { show: false },
					splitLine: { show: false },
					data: this.tradeProfitAndTradeCountData.labels, // Labels for categories (e.g., days or hours)
				},
				series: [
					{
						name: "Number of Trades",
						type: "bar",
						stack: "Total",
						data: this.tradeProfitAndTradeCountData.tradeCountData.map((value) => {
							return {
								value: parseFloat(value).toFixed(2),
								itemStyle: {
									color: value >= 0 ? "#5470C6" : "#e57373", // Blue for positive values, red for negative
								},
							};
						}),
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
						data: this.tradeProfitAndTradeCountData.profitData.map((value) => {
							return {
								value: parseFloat(value).toFixed(2),
								itemStyle: {
									color: value >= 0 ? "#A7C957" : "#e57373", // Green for positive values, red for negative
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
