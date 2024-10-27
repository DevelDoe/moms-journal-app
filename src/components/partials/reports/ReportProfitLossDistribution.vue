<template>
	<div class="profit-loss-histogram">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip">?
				<div v-if="isTooltipVisible" class="tooltip-text">
					The distribution of profit and loss across different price ranges. This rose chart helps you quickly identify where your profits and losses
					are concentrated, offering insights into risk and reward at various price points.
				</div>
			</span>
			<v-chart :option="chartOptions" autoresize style="width: 100%; height: 400px"></v-chart>
		</div>
	</div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

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
		profitByPriceRange() {
			if (this.trades.length === 0) return { labels: [], data: [] };

			// Extract unique dollar-based bucket values from `buyPrice`
			const uniqueBuckets = [
				...new Set(this.trades.map((trade) => Math.floor(trade.buyPrice))),
			].sort((a, b) => a - b); // Sort in ascending order

			// Initialize buckets with zero profit for each unique dollar value
			const buckets = uniqueBuckets.reduce((acc, dollar) => {
				acc[`$${dollar}-${dollar + 1}`] = 0;
				return acc;
			}, {});

			// Aggregate profit for each trade within its dollar range
			this.trades.forEach((trade) => {
				const dollarBucket = `$${Math.floor(trade.buyPrice)}-${Math.floor(trade.buyPrice) + 1}`;
				buckets[dollarBucket] += trade.profitLoss;
			});

			// Prepare data array for the pie chart
			return {
				data: Object.keys(buckets).map((label) => ({
					value: parseFloat(buckets[label].toFixed(2)),
					name: label,
				})),
			};
		},
		chartOptions() {
			return {
				title: {
					text: "Profit by Stock Price Range",
					left: "center",
					textStyle: {
						color: "#ffffff",
						fontSize: 18,
						fontWeight: "bold",
					},
				},
				tooltip: {
					trigger: "item",
					formatter: "{b}: {c} ({d}%)",
				},
				legend: {
					orient: "vertical",
					left: "left",
					textStyle: { color: "#eaeaea" },
				},
				series: [
					{
						name: "Profit/Loss",
						type: "pie",
						radius: ["20%", "60%"], // Adjust inner and outer radius for rose effect
						center: ["50%", "50%"],
						roseType: "radius", // Enables rose chart style
						data: this.profitByPriceRange.data,
						label: {
							color: "#eaeaea",
							formatter: "{b} : {c}", // Label format
						},
						labelLine: {
							lineStyle: {
								color: "rgba(255, 255, 255, 0.3)",
							},
							smooth: 0.2,
							length: 10,
							length2: 20,
						},
						itemStyle: {
							color: "#c23531",
							shadowBlur: 200,
							shadowColor: "rgba(0, 0, 0, 0.5)",
						},
						animationType: "scale",
						animationEasing: "elasticOut",
						animationDelay: function (idx) {
							return Math.random() * 200;
						},
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
	width: 1000%;
	padding: 2%;
	float: left;
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
