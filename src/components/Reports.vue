<template>
	<div id="trades" @wheel="handleScroll">
		<!-- Loading State -->
		<div v-if="isLoading" class="loading-message">Loading Reports...</div>

		<!-- No Trades -->
		<div v-else-if="trades && trades.length === 0" class="no-trades">No trades available for the selected date.</div>

		<!-- Corrupt Data Warning -->
		<div v-else-if="hasCorruptData" class="corrupt-data-warning">Some trades data is corrupted. Please contact an administrator.</div>

		<!-- Main Report Section -->
		<div v-else style="height: 100%;">
			<div class="content" style="height: 100%;">
				<div v-for="(report, index) in reports" :key="index" ref="reportRefs" style="height: 100%;">
					<component :is="report" :trades="trades" :granularity="granularity" />
				</div>
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
			reports: [ReportCumulativeProfit, ReportProfitLossDistribution],
			// Optional additional reports
			// reports: [ReportCumulativeProfit, ReportProfitLossDistribution, ReportTradesProfit, ReportProfitsByTime],
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
			this.hasCorruptData = trades.some(
				(trade) =>
					!trade ||
					!trade.symbol ||
					typeof trade.buyPrice !== "number" ||
					isNaN(new Date(trade.date).getTime())
			);
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

