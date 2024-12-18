<template>
    <div id="cumulative-profit" class="chart-container">
        <!-- Header with Tooltip -->
        <div class="chart-header">
            <span class="tooltip-icon" @mouseover="isTooltipVisible = true" @mouseleave="isTooltipVisible = false">
                ?
                <div v-if="isTooltipVisible" class="tooltip-text">This chart visualizes cumulative profit or loss alongside number of trades completed for the period.</div>
            </span>
            <h2>Cumulative Profit Chart</h2>
        </div>

        <!-- ECharts Visualization -->
        <div class="report-item">
            <v-chart :option="chartOptions" autoresize class="v-chart"></v-chart>
        </div>
    </div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent]);

export default {
    props: {
        trades: {
            type: Array,
            required: true,
        },
        granularity: {
            type: String,
            default: "daily", // Options: 'hourly', 'daily', 'weekly', 'monthly', 'yearly'
        },
    },
    components: { VChart },
    data() {
        return {
            isTooltipVisible: false,
        };
    },
    computed: {
        cumulativeProfitData() {
            if (!this.trades || this.trades.length === 0) return { labels: [], profits: [], avgProfits: [] };

            let cumulativeProfit = 0;
            let tradeCount = 0;

            const labels = [];
            const profits = [];
            const avgProfits = [];

            const formatDateByGranularity = (date) => {
                const d = new Date(date);
                switch (this.granularity) {
                    case "hourly":
                        return `${d.getHours().toString().padStart(2, "0")}:00`;
                    case "daily":
                        return d.toLocaleDateString();
                    case "weekly":
                        const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
                        return `${weekStart.toLocaleDateString()} (Week)`;
                    case "monthly":
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                    case "yearly":
                        return d.getFullYear().toString();
                    default:
                        return d.toLocaleDateString();
                }
            };

            const groupedTrades = this.trades.reduce((acc, trade) => {
                const key = formatDateByGranularity(trade.date);
                if (!acc[key]) acc[key] = [];
                acc[key].push(trade);
                return acc;
            }, {});

            Object.keys(groupedTrades)
                .sort((a, b) => new Date(a) - new Date(b))
                .forEach((key) => {
                    const tradesInGroup = groupedTrades[key];
                    labels.push(key);

                    tradesInGroup.forEach((trade) => {
                        cumulativeProfit += trade.profitLoss;
                        tradeCount++;
                    });

                    profits.push(cumulativeProfit.toFixed(2));
                    avgProfits.push((cumulativeProfit / tradeCount).toFixed(2));
                });

            return { labels, profits, avgProfits };
        },

        chartOptions() {
            return {
                tooltip: { trigger: "axis" },
                legend: {
                    data: ["Profits", "Avg Profit per Trade"],
                    bottom: 0,
                },
                xAxis: {
                    type: "category",
                    data: this.cumulativeProfitData.labels,
                    axisLabel: { rotate: 45 },
                    axisLine: { show: false }, // Hide x-axis line
                    axisTick: { show: false }, // Hide ticks on x-axis
                },
                yAxis: [
                    {
                        type: "value",
                        name: "Cumulative Profit ($)",
                        position: "right",
                        axisLine: { lineStyle: { color: "#4CAF50" }, show: false }, // Hide axis line
                        axisLabel: { color: "#4CAF50" },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: "rgba(0, 0, 0, 0)", // Optional: light grid lines
                            },
                        },
                        axisTick: { show: false }, // Hide ticks
                    },
                    {
                        type: "value",
                        name: "Avg Profit per Trade ($)",
                        position: "left",
                        axisLine: { lineStyle: { color: "#FFC107" }, show: false }, // Hide axis line
                        axisLabel: { color: "#FFC107" },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: "rgba(0, 0, 0, 0)", // Optional: light grid lines
                            },
                        },
                        axisTick: { show: false }, // Hide ticks
                    },
                ],
                grid: {
                    left: "10%",
                    right: "10%",
                    top: "15%",
                    bottom: "10%",
                    containLabel: true,
                },
                series: [
                    {
                        name: "Profits",
                        type: "line",
                        smooth: true,
                        data: this.cumulativeProfitData.profits,
                        yAxisIndex: 0,
                        itemStyle: { color: "#4CAF50" },
                    },
                    {
                        name: "Avg Profit per Trade",
                        type: "line",
                        smooth: true,
                        data: this.cumulativeProfitData.avgProfits,
                        yAxisIndex: 1,
                        itemStyle: { color: "#FFC107" },
                    },
                ],
            };
        },
    },
};
</script>

<style scoped></style>
