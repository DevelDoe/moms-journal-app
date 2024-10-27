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

        const buckets = this.trades.reduce((acc, trade) => {
            const bucketLabel = `${Math.floor(trade.buyPrice)}-${Math.floor(trade.buyPrice) + 1}`;

            if (!acc[bucketLabel]) acc[bucketLabel] = 0;
            acc[bucketLabel] += trade.profitLoss;

            return acc;
        }, {});

        return {
            data: Object.entries(buckets)
                .map(([label, value]) => ({
                    value: parseFloat(value.toFixed(2)),
                    name: label.split("-")[0],
                    isPositive: value > 0, // Store whether it's positive or negative for coloring
                })),
        };
    },
    chartOptions() {
        return {
            title: {
                text: "Profit/Loss by Price Range",
                left: "left",
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
                bottom: 20,
                textStyle: { color: "#eaeaea" },
                data: this.profitByPriceRange.data.map(item => item.name),
            },
            series: [
                {
                    name: "Profit/Loss",
                    type: "pie",
                    radius: ["20%", "55%"],
                    center: ["50%", "50%"],
                    roseType: "radius",
                    data: this.profitByPriceRange.data,
                    label: {
                        color: "#1E3E62",
                        fontSize: 14,
                        formatter: "{b}",
                    },
                    labelLine: {
                        lineStyle: {
                            color: "#162e49",
                        },
                        smooth: 0.2,
                        length: 20,
                        length2: 20,
                    },
                    itemStyle: {
                        color: (params) => {
                            // Color green if positive, red if negative
                            return params.data.isPositive ? "#32cd32" : "#ff7f50";
                        },
                        shadowBlur: 100,
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
