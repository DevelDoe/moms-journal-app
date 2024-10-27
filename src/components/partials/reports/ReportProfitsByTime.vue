<template>
	<div class="trades-by-time">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip">
				?
				<div v-if="isTooltipVisible" class="tooltip-text">
					This chart shows the profit and loss of trades aggregated by time intervals. Switch between hourly and minute views to analyze profitable
					and non-profitable times throughout the day.
				</div>
			</span>
		</div>
		<div class="granularity-picker">
			<div class="granularity-input">
				<select id="granularity" v-model="selectedGranularity">
					<option value="hourly">Hourly</option>
					<option value="minute">Minute</option>
				</select>
			</div>
		</div>
		<v-chart :option="chartOptions" autoresize style="width: 100%; height: 400px" id="trades-by-time-chart"></v-chart>
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
		// Aggregates trades by hour with full interval range from first to last entry
		aggregateTradesByHour() {
        const tradesByHour = Array(24).fill(0);
        this.filteredTrades.forEach((trade) => {
            const tradeHour = new Date(trade.date).getHours();
            tradesByHour[tradeHour] += trade.profitLoss;
        });

        // Find the min and max indices with data (could be 0 or non-zero)
        const minIndex = tradesByHour.findIndex((value, i) => tradesByHour.slice(i).some((val) => val !== undefined));
        const maxIndex = tradesByHour.length - 1 - [...tradesByHour].reverse().findIndex((value) => value !== undefined);

        return {
            labels: Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => `${i + minIndex}:00`),
            data: tradesByHour.slice(minIndex, maxIndex + 1),
        };
    },

    // Aggregates trades by minute with full interval range from first to last entry
    aggregateTradesByMinute() {
        const tradesByMinute = Array(1440).fill(0);
        this.filteredTrades.forEach((trade) => {
            const date = new Date(trade.date);
            const tradeMinute = date.getHours() * 60 + date.getMinutes();
            tradesByMinute[tradeMinute] += trade.profitLoss;
        });

        // Find the min and max indices with data (could be 0 or non-zero)
        const minIndex = tradesByMinute.findIndex((value, i) => tradesByMinute.slice(i).some((val) => val !== undefined));
        const maxIndex = tradesByMinute.length - 1 - [...tradesByMinute].reverse().findIndex((value) => value !== undefined);

        const labels = Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => {
            const totalMinutes = i + minIndex;
            const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
            const minutes = String(totalMinutes % 60).padStart(2, "0");
            return `${hours}:${minutes}`;
        });

        return {
            labels,
            data: tradesByMinute.slice(minIndex, maxIndex + 1),
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
			// Find the maximum absolute value in the data to center zero
			const maxAbsValue = Math.max(Math.abs(Math.min(...this.aggregatedData.data)), Math.max(...this.aggregatedData.data));
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
					axisPointer: { type: "shadow" },
				},
				grid: {
					left: "1%", // Add some padding on both sides for centering
					right: "0%",
					bottom: "0%",
					containLabel: true,
				},
				xAxis: {
					type: "category",
					data: this.aggregatedData.labels,
					axisLine: {
						lineStyle: { color: "#1E3E62" }, // Color of the x-axis line
					},
					axisLine: { show: false }, // Hide axis line if desired
					axisLabel: {
						color: "#1E3E62", // Color of the x-axis labels
						fontSize: 10, // Size of the font for the labels
					},
					splitLine: {
						lineStyle: {
							color: "#1E3E62", // Change this to your preferred color for the horizontal lines
							width: 0, // Thickness of the lines
							type: "solid", // Options: 'solid', 'dashed', 'dotted'
						},
					},
				},
				yAxis: {
					type: "value",
					name: "Profit/Loss",
					min: -maxAbsValue, // Set min to -maxAbsValue to center zero
					max: maxAbsValue, // Set max to maxAbsValue
					axisLine: { show: false }, // Hide axis line if desired
					axisLabel: {
						color: "#1E3E62",
						fontSize: 16,
						formatter: (value) => value.toFixed(2), // Limit to 2 decimal places
					},
					axisTick: { show: false }, // Hide ticks if desired
					splitLine: {
						lineStyle: {
							color: "#1E3E62", // Change this to your preferred color for the horizontal lines
							width: 0, // Thickness of the lines
							type: "solid", // Options: 'solid', 'dashed', 'dotted'
						},
					},
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
.trades-by-time {
	display: inline-block;
	margin-top: 20px;
	width: 100%;
}
#trades-by-time-chart {
	height: 80vh !important;
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
	display: inline-block;
    width: 150px;
    gap: 16px;
    background-color: #1e3e62;
    border-radius: 8px;
    padding: 0;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 2%;
	border: 1px solid #007bff;
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
	border-radius: 4px;
	font-size: 16px;
    color: #ffffff;
    background-color: #1e3e62;
	width: 150px;
}

.granularity-input select:focus {
	border-color: #007bff;
	box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
	outline: none;
}
</style>
