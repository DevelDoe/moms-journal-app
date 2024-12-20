<template>
    <div id="trades-by-time" class="chart-container">
        <div class="chart-header">
            <span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip">
                ?
                <div v-if="isTooltipVisible" class="tooltip-text">
                    This chart shows the profit and loss of trades aggregated by time intervals. Switch between hourly and minute views to analyze profitable and non-profitable times throughout the
                    day.
                </div>
            </span>
            <div class="granularity-picker">
                <div class="granularity-input">
                    <select id="granularity" v-model="selectedGranularity">
                        <option value="hourly">Hourly</option>
                        <option value="minute">Minute</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="report-item">
            <v-chart :option="chartOptions" autoresize class="v-chart"></v-chart>
        </div>
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
        aggregateTradesByHour() {
            const tradesByHour = Array(24).fill(0);
            let minHour = 23;
            let maxHour = 0;

            // Aggregate data and track min/max hours with data
            this.filteredTrades.forEach((trade) => {
                const tradeHour = new Date(trade.date).getHours();
                tradesByHour[tradeHour] += trade.profitLoss;
                if (tradeHour < minHour) minHour = tradeHour;
                if (tradeHour > maxHour) maxHour = tradeHour;
            });

            // Generate labels and data for the range with data only
            return {
                labels: Array.from({ length: maxHour - minHour + 1 }, (_, i) => `${i + minHour}:00`),
                data: tradesByHour.slice(minHour, maxHour + 1),
            };
        },

        aggregateTradesByMinute() {
            const tradesByMinute = Array(1440).fill(0);
            let minMinute = 1439;
            let maxMinute = 0;

            // Aggregate data and track min/max minutes with data
            this.filteredTrades.forEach((trade) => {
                const date = new Date(trade.date);
                const tradeMinute = date.getHours() * 60 + date.getMinutes();
                tradesByMinute[tradeMinute] += trade.profitLoss;
                if (tradeMinute < minMinute) minMinute = tradeMinute;
                if (tradeMinute > maxMinute) maxMinute = tradeMinute;
            });

            // Generate labels and data for the range with data only
            const labels = Array.from({ length: maxMinute - minMinute + 1 }, (_, i) => {
                const totalMinutes = i + minMinute;
                const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
                const minutes = String(totalMinutes % 60).padStart(2, "0");
                return `${hours}:${minutes}`;
            });

            return {
                labels,
                data: tradesByMinute.slice(minMinute, maxMinute + 1),
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
                tooltip: {
                    trigger: "axis",
                    axisPointer: { type: "none" },
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

<style scoped></style>
