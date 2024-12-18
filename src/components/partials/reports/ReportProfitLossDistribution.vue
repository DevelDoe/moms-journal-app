<template>
    <div id="price-range-chart" class="chart-container">
        <div class="chart-header">
            <span class="tooltip-icon" @mouseover="showTooltip" @mouseleave="hideTooltip">
                ?
                <div v-if="isTooltipVisible" class="tooltip-text">
                    The distribution of profit and loss across different price ranges. This rose chart helps you quickly identify where your profits and losses are concentrated, offering insights into
                    risk and reward at various price points. Red is losses and green is profits.
                </div>
            </span>
            <h2>Price Range</h2>
        </div>

        <div class="report-item">
            <v-chart :option="chartOptions" autoresize class="v-chart"></v-chart>
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
        profitAndLossByPriceRange() {
            if (this.trades.length === 0) return { profitData: [], lossData: [] };

            // Aggregate trades into profit and loss buckets
            const buckets = this.trades.reduce((acc, trade) => {
                const bucketLabel = `${Math.floor(trade.buyPrice)}-${Math.floor(trade.buyPrice) + 1}`;
                if (!acc[bucketLabel]) acc[bucketLabel] = 0;
                acc[bucketLabel] += trade.profitLoss;
                return acc;
            }, {});

            // Separate positive (profit) and negative (loss) buckets
            const profitData = [];
            const lossData = [];

            Object.entries(buckets).forEach(([label, value]) => {
                const formattedData = {
                    value: Math.abs(parseFloat(value.toFixed(2))), // Use absolute value for display
                    name: label.split("-")[0], // Show only the starting value in the label
                };
                if (value > 0) {
                    profitData.push(formattedData);
                } else if (value < 0) {
                    lossData.push(formattedData);
                }
            });

            return { profitData, lossData };
        },
        chartOptions() {
            const combinedData = [
                ...this.profitAndLossByPriceRange.profitData.map((item) => ({ ...item, itemStyle: { color: "#FEFF9F" } })),
                ...this.profitAndLossByPriceRange.lossData.map((item) => ({ ...item, itemStyle: { color: "#740938" } })),
            ];

            return {
                tooltip: {
                    trigger: "item",
                    formatter: "{b}: {c} ({d}%)",
                },
                series: [
                    {
                        name: "Price Range Distribution",
                        type: "pie",
                        radius: ["20%", "55%"],
                        center: ["50%", "50%"],
                        roseType: "radius",
                        data: combinedData,
                        label: {
                            color: "#fff",
                            formatter: "{b}",
                        },
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: "rgba(0, 0, 0, 0.5)",
                        },
                    },
                ],
            };
        },
    },
};
</script>

<style scoped></style>
