<template>
	<div class="trades-by-time-chart">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip">
				?
				<div v-if="isTooltipVisible" class="tooltip-text">
					This chart shows the profit and loss of trades aggregated by time intervals. Switch between hourly and minute views to analyze profitable and non-profitable times throughout the day.
				</div>
			</span>
		</div>
		<div class="granularity-selector">
			<label>Select Granularity:</label>
			<select v-model="selectedGranularity">
				<option value="hourly">Hourly</option>
				<option value="minute">Minute</option>
			</select>
		</div>
		<v-chart :option="chartOptions" autoresize style="width: 100%; height: 400px"></v-chart>
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
	},
	components: {
		VChart,
	},
	data() {
		return {
			isTooltipVisible: false,
			selectedGranularity: "hourly", // Default to hourly view
		};
	},
	methods: {
		showTooltip() {
			this.isTooltipVisible = true;
		},
		hideTooltip() {
			this.isTooltipVisible = false;
		},
		// Aggregates trades by hour
		aggregateTradesByHour() {
			const tradesByHour = Array(24).fill(0);
			this.filteredTrades.forEach((trade) => {
				const tradeHour = new Date(trade.date).getHours();
				tradesByHour[tradeHour] += trade.profitLoss;
			});
			return {
				labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
				data: tradesByHour,
			};
		},
		// Aggregates trades by minute
		aggregateTradesByMinute() {
			const tradesByMinute = Array(1440).fill(0);
			this.filteredTrades.forEach((trade) => {
				const date = new Date(trade.date);
				const tradeMinute = date.getHours() * 60 + date.getMinutes();
				tradesByMinute[tradeMinute] += trade.profitLoss;
			});
			const labels = Array.from({ length: 1440 }, (_, i) => {
				const hours = String(Math.floor(i / 60)).padStart(2, "0");
				const minutes = String(i % 60).padStart(2, "0");
				return `${hours}:${minutes}`;
			});
			return {
				labels,
				data: tradesByMinute,
			};
		},
	},
	computed: {
		filteredTrades() {
			return this.trades.filter((trade) => trade && trade.date && trade.profitLoss !== undefined);
		},
		// Selects the appropriate data aggregation method based on selectedGranularity
		aggregatedData() {
			return this.selectedGranularity === "hourly" ? this.aggregateTradesByHour() : this.aggregateTradesByMinute();
		},
		chartOptions() {
			return {
				title: {
					text: `Trades by ${this.selectedGranularity === "hourly" ? "Hour" : "Minute"}`,
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
						type: "shadow",
					},
				},
				xAxis: {
					type: "category",
					data: this.aggregatedData.labels,
				},
				yAxis: {
					type: "value",
					name: "Profit/Loss",
				},
				series: [
					{
						name: "Profit/Loss",
						type: "bar",
						data: this.aggregatedData.data,
						itemStyle: {
							color: (params) => (params.value >= 0 ? "#91cc75" : "#e57373"),
						},
					},
				],
			};
		},
	},
};
</script>

<style scoped>
.trades-by-time-chart {
	display: inline-block;
	margin-top: 20px;
	width: 100%;
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
.granularity-picker {
	display: flex;
	align-items: flex-end;
	gap: 16px;
	background-color: #1e3e62;
	border-radius: 8px;
	padding: 16px;
	width: 100%;
	max-width: 408px;
	box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
	margin-left: 10%;
}

.granularity-input {
	display: flex;
	flex-direction: column;
}

.granularity-input label {
	margin-bottom: 4px;
	font-weight: bold;
	color: #eaeaea;
}

.granularity-input select {
	padding: 8px;
	border: 1px solid #ccc;
	border-radius: 4px;
	font-size: 16px;
	color: #333;
	background-color: #fff;
	width: 180px;
}

.granularity-input select:focus {
	border-color: #007bff;
	box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
	outline: none;
}
</style>
