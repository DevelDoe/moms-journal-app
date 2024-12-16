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

        <v-chart :option="chartOptions" autoresize style="width: 100vh; height: 100vh; position: absolute; left:-80px; top:-80px"></v-chart>
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
            return {
                title: {
                    // text: "Profit and Loss by Price Range",
                    left: "left",
                    textStyle: {
                        color: "#1E3E62",
                        fontSize: 18,
                        fontWeight: "bold",
                    },
                },
                tooltip: {
                    trigger: "item",
                    formatter: "{d}%",
                },
                // legend: {
                //     orient: "horizontal",
                //     left: "center",
                //     top: 20,
                //     textStyle: { color: "#eaeaea" },
                //     data: [...this.profitAndLossByPriceRange.profitData.map((item) => item.name), ...this.profitAndLossByPriceRange.lossData.map((item) => item.name)],
                // },
                series: [
                    // Profit Series (right half with "roseType" effect)
                    {
                        name: "Profit",
                        type: "pie",
                        radius: ["20%", "55%"],
                        center: ["50%", "50%"],
                        roseType: "radius", // Adds size variation based on value
                        startAngle: 90,
                        endAngle: 270,
                        data: this.profitAndLossByPriceRange.profitData,
                        label: {
                            color: "#32cd32",
                            fontSize: 14,
                            formatter: "{b}",
                        },
                        itemStyle: {
                            color: (params) => {
                                const colors = ["#FEFF9F", "#D3EE98", "#A0D683", "#72BF78"];
                                return colors[params.dataIndex % colors.length];
                            },
                            shadowBlur: 100,
                            shadowColor: "rgba(0, 0, 0, 0.5)",
                        },
                        labelLine: {
                            show: true,
                            smooth: 0.2,
                            length: 20,
                            length2: 20,
                        },
                    },
                    // Loss Series (left half with "roseType" effect)
                    {
                        name: "Loss",
                        type: "pie",
                        radius: ["20%", "55%"],
                        center: ["50%", "50%"],
                        roseType: "radius", // Adds size variation based on value
                        startAngle: 270,
                        endAngle: 450,
                        data: this.profitAndLossByPriceRange.lossData,
                        label: {
                            color: "#ff6347",
                            fontSize: 14,
                            formatter: "{b}",
                        },
                        itemStyle: {
                            color: (params) => {
                                const colors = ["#740938", "#AF1740", "#CC2B52", "#DE7C7D"];
                                return colors[params.dataIndex % colors.length];
                            },
                            shadowBlur: 100,
                            shadowColor: "rgba(0, 0, 0, 0.5)",
                        },
                        labelLine: {
                            show: true,
                            smooth: 0.2,
                            length: 20,
                            length2: 20,
                        },
                    },
                ],
            };
        },
    },
};
</script>

<style scoped>
.chart-container {
    width: 50% !important; /* 50% of the parent container */
    height: 100% !important; /* Use full height relative to the parent container */
    padding: 0;
    margin: auto 0;
    float: right; /* Align to the right */
    display: flex; /* Use flex to center content */
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
    box-sizing: border-box; /* Include padding */
    padding: 0; /* Remove unnecessary padding */
    margin: 0; /* Remove any unwanted margin */
    position: relative;
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
</style>
