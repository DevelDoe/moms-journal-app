<template>
	<div id="trades" @wheel="handleScroll">
		<div v-if="isLoading" class="loading-message">Loading Reports...</div>
		<div v-else-if="trades && trades.length === 0" class="no-trades">No trades available for the selected date.</div>
		<div v-else-if="hasCorruptData" class="corrupt-data-warning">Some trades data is corrupted. Please contact an administrator.</div>

		<!-- Main Report Section -->
		<div v-else>
			<div class="content">
				<div v-for="(report, index) in reports" :key="index" ref="reportRefs" :style="{ height: `${viewportHeight}px` }">
					<button v-if="index > 0" @click="scrollToPreviousReport(index)">Back</button>
					<component :is="report" :trades="trades" :granularity="report === ReportCumulativeProfit ? granularity : undefined" />
					<button v-if="index < reports.length - 1" @click="scrollToNextReport(index)">Next</button>
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
import ReportProfitLossAccuracy from './partials/reports/ReportProfitLossAccuracy.vue';

export default {
	components: {
		ReportCumulativeProfit,
		ReportProfitLossDistribution,
		ReportProfitsByTime,
		ReportTradesProfit,
		ReportProfitLossAccuracy,
	},
	data() {
		return {
			hasCorruptData: false,
			viewportHeight: window.innerHeight,
			reports: [ReportProfitLossAccuracy, ReportCumulativeProfit, ReportProfitLossDistribution, ReportTradesProfit, ReportProfitsByTime],
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
	methods: {
		scrollToNextReport(index) {
			const nextReport = this.$refs.reportRefs[index + 1];
			nextReport?.scrollIntoView({ behavior: 'smooth' });
		},
		scrollToPreviousReport(index) {
			const previousReport = this.$refs.reportRefs[index - 1];
			previousReport?.scrollIntoView({ behavior: 'smooth' });
		},
		handleScroll(event) {
			const activeReport = this.$refs.reportRefs.find(report => {
				const rect = report.getBoundingClientRect();
				return rect.top >= 0 && rect.bottom <= window.innerHeight;
			});
			if (!activeReport) return;

			const currentIndex = this.$refs.reportRefs.indexOf(activeReport);
			if (event.deltaY > 0 && currentIndex < this.reports.length - 1) this.scrollToNextReport(currentIndex);
			else if (event.deltaY < 0 && currentIndex > 0) this.scrollToPreviousReport(currentIndex);
		},
		updateViewportHeight() {
			this.viewportHeight = window.innerHeight;
		},
	},
	mounted() {
		window.addEventListener('resize', this.updateViewportHeight, { passive: true });
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.updateViewportHeight);
	},
};
</script>
