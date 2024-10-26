<template>
	<div class="cumulative-profit-chart">
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
			const tradesByDay = sortedTrades.reduce((acc, trade) => {
				const dateKey = new Date(trade.date).toLocaleDateString();
				if (!acc[dateKey]) {
					acc[dateKey] = [];
				}
				acc[dateKey].push(trade);
				return acc;
			}, {});

			Object.keys(tradesByDay).forEach((date) => {
				const trades = tradesByDay[date];
				labels.push(date);

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
						smooth: true,
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
