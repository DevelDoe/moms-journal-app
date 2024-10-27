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

        // Aggregate trades into non-zero buckets only
        const buckets = this.trades.reduce((acc, trade) => {
            const bucketLabel = `$${Math.floor(trade.buyPrice)}-${Math.floor(trade.buyPrice) + 1}`;
            if (!acc[bucketLabel]) acc[bucketLabel] = 0;
            acc[bucketLabel] += trade.profitLoss;
            return acc;
        }, {});

        // Filter out zero or near-zero values (e.g., < 0.01) for a clean chart
        return {
            data: Object.keys(buckets)
                .filter((label) => Math.abs(buckets[label]) > 0.01) // Exclude zero or very small buckets
                .map((label) => ({
                    value: parseFloat(buckets[label].toFixed(2)),
                    name: label,
                })),
        };
    },
    chartOptions() {
        return {
            title: { ... },
            tooltip: { ... },
            legend: {
                orient: "horizontal",
                left: "center",
                bottom: 20,
                textStyle: { color: "#eaeaea" },
                formatter: (name) => name.split("-")[0], // Show only the start value
            },
            series: [
                {
                    name: "Profit/Loss",
                    type: "pie",
                    radius: ["0%", "50%"],
                    center: ["50%", "50%"],
                    roseType: "radius",
                    data: this.profitByPriceRange.data,
                    label: { ... },
                    labelLine: { ... },
                    itemStyle: { ... },
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
#price-range-chart {
	min-height: 700px;

	height: 100vh !important;
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
