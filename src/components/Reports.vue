<template>
	<div id="trades" @wheel="handleScroll">
		<div v-if="isLoading" class="loading-message">Loading Reports...</div>
		<div v-else-if="trades && trades.length === 0" class="no-trades">No trades available for the selected date.</div>
		<div v-else-if="hasCorruptData" class="corrupt-data-warning">Some trades data is corrupted. Please contact an administrator.</div>

		<!-- Main Report Section -->
		<div v-else style="height: 100%;">
			<div class="content" style="height: 100%;">
				<div v-for="(report, index) in reports" :key="index" ref="reportRefs" style="height: 100%;">
					<component :is="report" :trades="trades" :granularity="report === ReportCumulativeProfit ? granularity : undefined" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import ReportCumulativeProfit from './partials/reports/ReportCumulativeProfit.vue';
import ReportProfitLossDistribution from './partials/reports/ReportProfitLossDistribution.vue';
import ReportProfitsByTime from './partials/reports/ReportProfitsByTime.vue';
import ReportTradesProfit from './partials/reports/ReportTradesProfit.vue';

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
            // reports: [ReportCumulativeProfit, ReportProfitLossDistribution, ReportTradesProfit, ReportProfitsByTime],
		};
	},
	computed: {
		...mapGetters(['getStartDate', 'getEndDate', 'getTrades', 'isLoading']), // Use store getters for trades and loading state
		isSingleDayRange() {
			return this.getStartDate === this.getEndDate;
		},
		granularity() {
			return this.isSingleDayRange ? "hourly" : "daily";
		},
		trades() {
			const trades = this.getTrades || [];
			this.hasCorruptData = trades.some(trade => !trade || !trade.symbol || trade.buyPrice === undefined || isNaN(new Date(trade.date).getTime()));
			return trades;
		}, 
	},
};
</script>
