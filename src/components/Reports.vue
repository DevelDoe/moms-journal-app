<template>
    <div id="trades" @wheel="handleScroll">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-message">Loading Reports...</div>

        <!-- No Trades -->
        <div v-else-if="trades && trades.length === 0" class="no-trades">No trades available for the selected date.</div>

        <!-- Corrupt Data Warning -->
        <div v-else-if="hasCorruptData" class="corrupt-data-warning">Some trades data is corrupted. Please contact an administrator.</div>

        <!-- Main Report Section -->
        <div v-else class="report-grid">
            <div v-for="(report, index) in reports" :key="index" class="report-item">
                <component :is="report" :trades="trades" :granularity="granularity" />
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import ReportCumulativeProfit from "./partials/reports/ReportCumulativeProfit.vue";
import ReportProfitLossDistribution from "./partials/reports/ReportProfitLossDistribution.vue";
import ReportProfitsByTime from "./partials/reports/ReportProfitsByTime.vue";
import ReportTradesProfit from "./partials/reports/ReportTradesProfit.vue";

export default {
    components: {
        ReportCumulativeProfit,
        ReportProfitLossDistribution,
        ReportProfitsByTime,
        ReportTradesProfit,
    },
    data() {
        return {
            hasCorruptData: false,
            // reports: [ReportCumulativeProfit, ReportProfitLossDistribution],
            // Optional additional reports
            reports: [ReportCumulativeProfit, ReportProfitLossDistribution, ReportTradesProfit, ReportProfitsByTime],
        };
    },
    computed: {
        ...mapGetters(["getStartDate", "getEndDate", "getTrades", "isLoading"]),
        isSingleDayRange() {
            return this.getStartDate === this.getEndDate;
        },
        granularity() {
            return this.isSingleDayRange ? "hourly" : "daily";
        },
        trades() {
            const trades = this.getTrades || [];
            // Enhanced corrupt data detection
            this.hasCorruptData = trades.some((trade) => !trade || !trade.symbol || typeof trade.buyPrice !== "number" || isNaN(new Date(trade.date).getTime()));
            return trades;
        },
    },
    methods: {
        handleScroll(event) {
            // Handle scrolling between reports
            const scrollDirection = event.deltaY > 0 ? "down" : "up";
            console.log(`Scrolling ${scrollDirection}`);
            // Add scrolling logic here if necessary (e.g., move between report sections)
        },
    },
};
</script>
<style>
/* General Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

#trades {
    padding: 10px;
}

.report-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Two equal columns */
    grid-auto-rows: calc((100vh - 80px) / 2); /* Each row is half the viewport height minus taskbar */
    gap: 10px;
    margin: 0;
    overflow-y: auto; /* Allow vertical scrolling if needed */
}

.report-item {
    display: flex; /* Enable flexbox */
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
    height: 100%; /* Ensure it fully occupies its grid cell */
    overflow: hidden; /* Prevent content overflow */
}

.v-chart {
    width: 60vh; /* Set desired width */
    height: 40vh; /* Set desired height */
}

.chart-header {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.2);
}
.tooltip-icon {
    background: #007bff;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    text-align: center;
    cursor: pointer;
    font-size: 13px;
    line-height: 19px;
    margin-right: 0;
    position: absolute;
    top: 0px;
    right: -36px;
}

.tooltip-text {
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
/* Responsive Adjustment: Single Column on Small Screens */
@media (max-width: 768px) {
    .report-grid {
        grid-template-columns: 1fr; /* Single column */
    }
}
</style>
