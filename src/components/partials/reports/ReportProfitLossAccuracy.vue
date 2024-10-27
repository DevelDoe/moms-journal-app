<template>
	<div class="gauge-container">
		<div class="gauge">
			<v-chart :option="profitToLossGaugeOptions" autoresize style="width: 100%; height: 300px"></v-chart>
			<div class="gauge-label">Profit-to-Loss Ratio</div>
		</div>
		<div class="gauge">
			<v-chart :option="accuracyGaugeOptions" autoresize style="width: 100%; height: 300px"></v-chart>
			<div class="gauge-label">Accuracy</div>
		</div>
	</div>
</template>

<script>
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { GaugeChart } from "echarts/charts";
import { TitleComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

use([CanvasRenderer, GaugeChart, TitleComponent, TooltipComponent]);

export default {
	props: {
		trades: {
			type: Array,
			required: true,
		},
	},
	computed: {
		accuracy() {
			const totalTrades = this.trades.length;
			const winningTrades = this.trades.filter((trade) => trade.profitLoss > 0).length;
			return totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(2) : 0;
		},
		profitToLossRatio() {
			const totalProfit = this.trades.filter((trade) => trade.profitLoss > 0).reduce((acc, trade) => acc + trade.profitLoss, 0);
			const totalLoss = Math.abs(this.trades.filter((trade) => trade.profitLoss < 0).reduce((acc, trade) => acc + trade.profitLoss, 0));

			// Calculate ratio as "X:Y" format
			const ratio = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : "1.00";
			return `${ratio}:1`;
		},
		profitToLossGaugeOptions() {
			return {
				series: [
					{
						type: 'gauge',
                min: 0,
                max: 100,
                splitNumber: 2,  // Fewer split marks for minimalism
                axisLine: {
                    lineStyle: {
                        width: 6, // Thinner line for a minimal look
                        color: [
                            [0.5, '#91cc75'],  // Green for under 1:1 ratio
                            [1, '#e57373']    // Red for over 1:1 ratio
                        ]
                    }
                },
                pointer: {
                    width: 4, // Thin pointer
                    length: '60%', // Shorter length for a subtle look
                },
                axisTick: {
                    show: false // Hide tick marks for minimalism
                },
                splitLine: {
                    show: false // Hide split lines for minimalism
                },
                axisLabel: {
                    show: false // Hide labels around the gauge for a cleaner look
                },
                detail: {
                    valueAnimation: true,
                    fontSize: 16,
                    color: '#333',
                    formatter: '{value}%',  // Display the value in the center only
                },
						data: [{ value: parseFloat(this.profitToLossRatio.split(":")[0]) }],
					},
				],
			};
		},
		accuracyGaugeOptions() {
			return {
				series: [
					{
						type: "gauge",
						startAngle: 180,
						endAngle: 0,
						min: 0,
						max: 100,
						progress: { show: true, width: 10 },
						axisLine: {
							lineStyle: {
								width: 10,
								color: [
									[0.5, "#e57373"],
									[0.75, "#ffb74d"],
									[1, "#81c784"],
								],
							},
						},
						pointer: { width: 6 },
						title: { show: false },
						detail: { valueAnimation: true, formatter: "{value}%", fontSize: 20 },
						data: [{ value: this.accuracy }],
					},
				],
			};
		},
	},
	components: {
		VChart,
	},
};
</script>

<style scoped>
.gauge-container {
	display: flex;
	justify-content: space-around;
	align-items: center;
	width: 100%;
}
.gauge {
	width: 45%;
	text-align: center;
}
.gauge-label {
	margin-top: 8px;
	font-size: 1.2rem;
	color: #eaeaea;
	font-weight: bold;
}
</style>
