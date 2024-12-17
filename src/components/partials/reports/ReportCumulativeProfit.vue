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
        <v-chart :option="chartOptions" autoresize style="width: 95vh; height: 70vh; position: absolute; left: 0px; top: 40px" class="chart"></v-chart>
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
            if (!this.trades || this.trades.length === 0) return { labels: [], profits: [], tradeCounts: [] };

            let cumulativeProfit = 0;
            let cumulativeTrades = 0;

            const labels = [];
            const profits = [];
            const tradeCounts = [];

            // Helper function to format dates based on granularity
            const formatDateByGranularity = (date) => {
                const d = new Date(date);
                switch (this.granularity) {
                    case "hourly":
                        return `${d.getHours().toString().padStart(2, "0")}:00`; // Show only the hour
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

            // Group trades based on formatted date keys
            const groupedTrades = this.trades.reduce((acc, trade) => {
                const key = formatDateByGranularity(trade.date);
                if (!acc[key]) acc[key] = [];
                acc[key].push(trade);
                return acc;
            }, {});

            // Process grouped trades
            Object.keys(groupedTrades)
                .sort((a, b) => new Date(a) - new Date(b)) // Sort keys chronologically
                .forEach((key) => {
                    const tradesInGroup = groupedTrades[key];
                    labels.push(key);

                    // Sum up profit for the group
                    tradesInGroup.forEach((trade) => {
                        cumulativeProfit += trade.profitLoss;
                    });

                    // Increment trade count for the group
                    cumulativeTrades += tradesInGroup.length;

                    profits.push(cumulativeProfit.toFixed(2));
                    tradeCounts.push(cumulativeTrades);
                });

            return { labels, profits, tradeCounts };
        },

        chartOptions() {
            return {
                tooltip: { trigger: "axis" },
                legend: {
                    data: ["Profits", "Trade Count"],
                    bottom: 0,
                    selected: {
                        Profits: true,
                        "Trade Count": true, // Start with only profits active
                    },
                },
                xAxis: {
                    type: "category",
                    data: this.cumulativeProfitData.labels,
                    axisLabel: { rotate: 45 },
                },
                yAxis: [
                    // Profits Axis (Left)
                    {
                        type: "value",
                        name: "Cumulative Profit ($)",
                        position: "right",
                        axisLine: { lineStyle: { color: "#4CAF50" } }, // Green axis line
                        axisLabel: { color: "#4CAF50" },
                        splitLine: { show: false }, // Turn off grid lines
                    },
                    // Trade Count Axis (Right)
                    {
                        type: "value",
                        name: "Trade Count",
                        position: "left",
                        axisLine: { lineStyle: { color: "#FFC107" } }, // Yellow axis line
                        axisLabel: { color: "#FFC107" },
                        splitLine: { show: false }, // Turn off grid lines
                    },
                ],
                grid: {
                    left: "10%", // Adjust spacing for alignment
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
                        yAxisIndex: 0, // Use left axis
                        itemStyle: { color: "#4CAF50" }, // Green line
                    },
                    {
                        name: "Trade Count",
                        type: "line",
                        smooth: true,
                        data: this.cumulativeProfitData.tradeCounts,
                        yAxisIndex: 1, // Use right axis
                        itemStyle: { color: "#FFC107" }, // Yellow line
                    },
                ],
            };
        },
    },
};
</script>

<style scoped>
.chart-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    width: 50% !important; /* 50% of the parent container */
    height: 100% !important; /* Use full height relative to the parent container */
    padding: 0;
    margin: auto 0;
    box-sizing: border-box;
    position: relative;
    float: left;
}

.chart-header {
    position: absolute;
    top: 38px;
    left: 59px;
    opacity: 0.5;
    font-size: 12px;
}

.tooltip-icon {
    background: #007bff;
    color: white;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    text-align: center;
    cursor: pointer;
    font-size: 12px;
    line-height: 17px;
    margin-right: 10px;
    position: absolute;
    top: 8px;
    right: -36px;
}

.tooltip-text {
    position: absolute;
    background: #333;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    top: 25px;
    left: 0;
    width: 200px;
    font-size: 12px;
    white-space: normal;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.chart {
    width: 100%;
    height: 100%;
}
</style>
