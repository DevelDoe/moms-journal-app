<template>
	<div class="profit-loss-histogram">
		<div class="chart-header">
			<span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip"
				>?
				<div v-if="isTooltipVisible" class="tooltip-text">
					The distribution of profit and loss across different price ranges. This rose chart helps you quickly identify where your profits and losses
					are concentrated, offering insights into risk and reward at various price points.
				</div>
			</span>
			<v-chart :option="chartOptions" autoresize style="width: 100%; height: 400px" id="price-range-chart"></v-chart>
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
			if (this.trades.length === 0) return { data: [] };

			// Initialize buckets for non-zero trades
			const buckets = this.trades.reduce((acc, trade) => {
				const bucketLabel = `$${Math.floor(trade.buyPrice)}-${Math.floor(trade.buyPrice) + 1}`;
				if (!acc[bucketLabel]) acc[bucketLabel] = 0;
				acc[bucketLabel] += trade.profitLoss;
				return acc;
			}, {});

			// Filter out empty buckets and prepare data for the chart
			return {
				data: Object.keys(buckets)
					.filter((label) => buckets[label] !== 0) // Exclude zero profit/loss buckets
					.map((label) => ({
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
						color: "#eaeaea",
						fontSize: 18,
						fontWeight: "bold",
					},
				},
				tooltip: {
					trigger: "item",
					formatter: "{b}: {c} ({d}%)",
				},
				legend: {
					orient: "horizontal",
					left: "center",
					bottom: 0, // Add some padding at the bottom of the chart for the legend
					textStyle: { color: "#eaeaea" },
				},

				series: [
					{
						name: "Profit/Loss",
						type: "pie",
						radius: ["20%", "50%"],
						center: ["50%", "50%"],
						roseType: "radius",
						data: this.profitByPriceRange.data,
						label: {
							color: "#1E3E62",
							formatter: "{b} : {c}", // Label format
						},
						labelLine: {
							lineStyle: {
								color: "#1E3E62",
							},
							smooth: 0.2,
							length: 100,
							length2: 200,
							
						},
						itemStyle: {
							// Dynamic gradient for each segment based on value
							color: (params) => {
								const colors = ["#ff7f50", "#87ceeb", "#da70d6", "#32cd32", "#6495ed", "#ff69b4"];
								return {
									type: "linear",
									x: 0,
									y: 0,
									x2: 1,
									y2: 1,
									colorStops: [
										{ offset: 0, color: colors[params.dataIndex % colors.length] },
										{ offset: 1, color: "#eaeaea" },
									],
								};
							},
							shadowBlur: 200,
							shadowColor: "rgba(0, 0, 0, 0.5)",
						},
						animationType: "scale",
						animationEasing: "elasticOut",
						animationDelay: (idx) => Math.random() * 200,
					},
				],
			};
		},
	},
};
</script>

<style scoped>
#price-range-chart{
	min-height: 700px;
}
.profit-loss-histogram {
	margin-top: 20px;
	/* width: 48%; */
	/* padding: 2%; */
	/* float: left; */
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
