<!-- ./src/components/partials/charts/CumulativeProfitChart.vue -->
<template>
	<div class="cumulative-profit-chart">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip"
				>?
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
		filterDate: {
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
		trades() {
			const tradesData = this.$store.getters.getTrades;
			return tradesData && Array.isArray(tradesData) ? tradesData : [];
		},
		filteredTrades() {
			this.hasCorruptData = false; // Reset corrupt data flag

			// Shallow unwrap each trade object using spread syntax
			const tradesArray = this.trades.map((trade) => ({ ...trade }));

			const validTrades = tradesArray.filter((trade) => {
				const isValid =
					trade && trade.symbol && trade.buyPrice !== undefined && trade.sellPrice !== undefined && trade.profitLoss !== undefined && trade.date;

				if (!isValid) {
					this.hasCorruptData = true; // Mark if there's corrupt data
					return false;
				}
				return isValid;
			});

			// If no filter date is selected, return all valid trades
			if (!this.filterDate) {
				return validTrades;
			}

			// Filter trades by selected date if a date is set
			const formattedFilterDate = new Date(this.filterDate).toISOString().split("T")[0];
			return validTrades.filter((trade) => {
				const formattedTradeDate = new Date(trade.date).toISOString().split("T")[0];
				return formattedFilterDate === formattedTradeDate;
			});
		},
		cumulativeProfitData() {
			if (this.filteredTrades.length === 0) {
				return { labels: [], profitData: [], tradeCountData: [] }; // No trades available
			}

			const isSingleDay = this.filterDate !== ""; // Assume filterDate means filtering to a specific day

			// Sort the trades by date
			const sortedTrades = [...this.filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date));

			// Initialize cumulative values
			let cumulativeProfit = 0;
			let cumulativeTradeCount = 0;
			const labels = [];
			const profitData = [];
			const tradeCountData = [];

			if (isSingleDay) {
				// Group trades by minute for the filtered day
				const tradesByMinute = sortedTrades.reduce((acc, trade) => {
					const date = new Date(trade.date);
					const minuteKey = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`; // e.g., '14:05'
					if (!acc[minuteKey]) {
						acc[minuteKey] = [];
					}
					acc[minuteKey].push(trade);
					return acc;
				}, {});

				// Calculate cumulative profit and number of trades for each minute
				Object.keys(tradesByMinute).forEach((minute) => {
					const trades = tradesByMinute[minute];
					labels.push(minute);

					// Update cumulative profit
					trades.forEach((trade) => {
						cumulativeProfit += trade.profitLoss;
					});
					profitData.push(cumulativeProfit);

					// Update cumulative number of trades
					cumulativeTradeCount += trades.length;
					tradeCountData.push(cumulativeTradeCount);
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

				// Calculate cumulative profit and cumulative number of trades for each day
				Object.keys(tradesByDay).forEach((date) => {
					const trades = tradesByDay[date];
					labels.push(date);

					// Update cumulative profit
					trades.forEach((trade) => {
						cumulativeProfit += trade.profitLoss;
					});
					profitData.push(cumulativeProfit);

					// Update cumulative number of trades
					cumulativeTradeCount += trades.length;
					tradeCountData.push(cumulativeTradeCount);
				});
			}

			return {
				labels,
				profitData,
				tradeCountData,
			};
		},
		cumulativeProfitLabels() {
			return this.cumulativeProfitData.labels;
		},
		cumulativeProfitValues() {
			return this.cumulativeProfitData.profitData;
		},
		cumulativeTradeCountValues() {
			return this.cumulativeProfitData.tradeCountData;
		},
		chartOptions() {
			return {
				title: {
					text: "Cumulative Profit and Number of Trades Over Time",
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "line",
					},
				},
				xAxis: {
					type: "category",
					data: this.labels, // Labels for time periods (e.g., dates)
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
						data: this.profitData.map((value) => parseFloat(value.toFixed(2))), // Cumulative profit data over time data: this.profitData, // Cumulative profit data over time
						itemStyle: {
							color: "#e57373", // Line color for profit
						},
						smooth: true, // Make the line smooth
					},
					{
						name: "Number of Trades",
						type: "line",
						data: this.tradeCountData, // Number of trades at each point in time
						yAxisIndex: 1, // Use the second y-axis for trade count
						itemStyle: {
							color: "#5470C6", // Line color for trade count
						},
						smooth: true, // Make the line smooth
					},
				],
			};
		},
	},
};
</script>

<style scoped>
.cumulative-profit-chart {
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
