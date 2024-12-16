<template>
    <div class="gauge-container">
        <!-- Profit-to-Loss Gauge -->
        <div class="gauge-row">
            <div class="gauge">
                <v-chart :option="profitToLossGaugeOptions" autoresize style="width: 50px; height: 50px;"></v-chart>
            </div>
            <div class="gauge-value">{{ profitToLossRatio }}</div>
        </div>

        <!-- Accuracy Gauge -->
        <div class="gauge-row">
            <div class="gauge">
                <v-chart :option="accuracyGaugeOptions" autoresize style="width: 50px; height: 50px;"></v-chart>
            </div>
            <div class="gauge-value">{{ accuracy }}%</div>
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
            const ratio = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : "1.00";
            return `${ratio}:1`;
        },
        profitToLossGaugeOptions() {
            return {
                series: [
                    {
                        type: "gauge",
                        startAngle: 180,
                        endAngle: 0,
                        min: 0,
                        max: 2,
                        center: ["50%", "75%"],
                        radius: "100%",
                        progress: { show: true, width: 6 },
                        axisLine: {
                            lineStyle: {
                                width: 6,
                                color: [
                                    [0.5, "#FF6E76"],
                                    [1, "#7CFFB2"],
                                ],
                            },
                        },
                        pointer: { width: 5, length: "60%", itemStyle: { color: "auto" } },
                        axisLabel: { show: false },
                        splitLine: { show: false },
                        axisTick: { show: false },
                        title: { show: false },
                        detail: { show: false },
                        data: [{ value: this.profitToLossRatio.split(":")[0] }],
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
                        center: ["50%", "75%"],
                        radius: "100%",
                        progress: { show: true, width: 6 },
                        axisLine: {
                            lineStyle: {
                                width: 6,
                                color: [
                                    [0.5, "#FF6E76"],
                                    [0.6, "#FDDD60"],
                                    [1, "#7CFFB2"],
                                ],
                            },
                        },
                        pointer: { width: 5, length: "60%", itemStyle: { color: "auto" } },
                        axisLabel: { show: false },
                        splitLine: { show: false },
                        axisTick: { show: false },
                        title: { show: false },
                        detail: { show: false },
                        data: [{ value: this.accuracy }],
                    },
                ],
            };
        },
    },
    components: { VChart },
};
</script>

<style scoped>
.gauge-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 40px; /* Space between gauge rows */
}

.gauge-row {
    display: flex;
    align-items: center;
    gap: 10px; /* Space between the gauge and the value */
}

.gauge {
    display: flex;
    justify-content: center;
    align-items: center;
}

.gauge-value {
    font-size: 1.1rem;
    font-weight: bold;
    color: #333;
}
</style>
