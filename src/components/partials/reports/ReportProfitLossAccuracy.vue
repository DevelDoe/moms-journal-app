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
	components: {
		VChart,
	},
	props: {
		profitToLossRatio: {
			type: Number,
			default: 100, // Default ratio for display purposes
		},
		accuracy: {
			type: Number,
			default: 75, // Default accuracy for display purposes
		},
	},
	computed: {
		profitToLossGaugeOptions() {
			return {
				series: [
					{
						type: "gauge",
						startAngle: 180,
						endAngle: 0,
						min: 0,
						max: 300, // Range for the Profit-to-Loss Ratio gauge
						progress: { show: true, width: 10 },
						axisLine: {
							lineStyle: {
								width: 10,
								color: [[0.3, "#e57373"], [0.7, "#ffb74d"], [1, "#81c784"]], // Gradient: Red to Yellow to Green
							},
						},
						pointer: { width: 6 },
						title: { show: false },
						detail: { valueAnimation: true, formatter: "{value}%", fontSize: 20 },
						data: [{ value: this.profitToLossRatio }],
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
						max: 100, // Range for the Accuracy gauge
						progress: { show: true, width: 10 },
						axisLine: {
							lineStyle: {
								width: 10,
								color: [[0.5, "#e57373"], [0.75, "#ffb74d"], [1, "#81c784"]], // Gradient: Red to Yellow to Green
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
};
</script>

<style scoped>
.gauge-container {
	display: flex;
	justify-content: space-around;
	align-items: center;
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
