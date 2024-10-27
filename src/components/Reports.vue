<template>
	<div id="trades" @wheel="handleScroll">
		<div v-if="isLoading" class="loading-message">
			<p>Loading Reports...</p>
		</div>

		<div v-else-if="trades && trades.length === 0" class="no-trades">
			<p>No trades available for the selected date.</p>
		</div>
		<div v-else-if="hasCorruptData" class="corrupt-data-warning">
			<p>Some trades data is corrupted and could not be displayed. Please contact an administrator.</p>
		</div>

		<div v-else>
			<!-- <div class="header">
				<div class="page-title">Reports</div>
				<div class="date-range-picker">
					<div class="date-input">
						<label>Start Date:</label>
						<input type="date" v-model="startDate" />
					</div>
					<div class="date-input">
						<label>End Date:</label>
						<input type="date" v-model="endDate" />
					</div>
				</div>
			</div> -->

			<div class="content">
				<div
					class="report"
					v-for="(report, index) in reports"
					:key="index"
					ref="reportRefs"
					:style="{ height: `${viewportHeight}px` }"
				>
					<button v-if="index > 0" @click="scrollToPreviousReport(index)" class="back-button">
						Back
					</button>
					<component :is="report" :trades="trades" />
					<button v-if="index < reports.length - 1" @click="scrollToNextReport(index)" class="next-button">
						Next
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ReportCumulativeProfit from "./partials/reports/ReportCumulativeProfit.vue";
import ReportProfitLossDistribution from "./partials/reports/ReportProfitLossDistribution.vue";
import ReportProfitsByTime from "./partials/reports/ReportProfitsByTime.vue";
import ReportTradesProfit from "./partials/reports/ReportTradesProfit.vue";

export default {
	data() {
		return {
			isLoading: true,
			hasCorruptData: false,
			startDate: "", // Start date for fetching
			endDate: "", // End date for fetching
			trades: [], // Fetched trades directly from backend
			viewportHeight: window.innerHeight -20,
			reports: [
				ReportCumulativeProfit,
				ReportProfitLossDistribution,
				ReportTradesProfit,
				ReportProfitsByTime,
			],
		};
	},
	components: {
		ReportCumulativeProfit,
		ReportTradesProfit,
		ReportProfitLossDistribution,
		ReportProfitsByTime,
	},
	methods: {
		scrollToNextReport(index) {
			const nextReport = this.$refs.reportRefs[index + 1];
			if (nextReport) {
				nextReport.scrollIntoView({ behavior: "smooth" });
			}
		},
		scrollToPreviousReport(index) {
			const previousReport = this.$refs.reportRefs[index - 1];
			if (previousReport) {
				previousReport.scrollIntoView({ behavior: "smooth" });
			}
		},
		handleScroll(event) {
			const activeReport = this.$refs.reportRefs.find((report) => {
				const rect = report.getBoundingClientRect();
				return rect.top >= 0 && rect.bottom <= window.innerHeight;
			});

			if (!activeReport) return;

			const currentIndex = this.$refs.reportRefs.indexOf(activeReport);

			if (event.deltaY > 0 && currentIndex < this.reports.length - 1) {
				this.scrollToNextReport(currentIndex);
			} else if (event.deltaY < 0 && currentIndex > 0) {
				this.scrollToPreviousReport(currentIndex);
			}
		},
		async fetchTradesByDateRange(start = null, end = null) {
			try {
				// Ensure dates are either null or in "YYYY-MM-DD" format
				if (start && isNaN(new Date(start).getTime())) {
					console.error("Invalid start date format:", start);
					return;
				}
				if (end && isNaN(new Date(end).getTime())) {
					console.error("Invalid end date format:", end);
					return;
				}

				this.isLoading = true;

				// Dispatch action to fetch trades with the date range
				await this.$store.dispatch("fetchTrades", { start, end });

				// Assign fetched trades to the component's data
				this.trades = this.$store.getters.getTrades || [];

				// Check for corrupt data directly in the trades array
				this.hasCorruptData = this.trades.some(
					(trade) =>
						!trade ||
						!trade.symbol ||
						trade.buyPrice === undefined ||
						trade.sellPrice === undefined ||
						trade.profitLoss === undefined ||
						!trade.date ||
						isNaN(new Date(trade.date).getTime()) // Validate date format
				);

				if (this.hasCorruptData) {
					console.warn("Corrupt trade data found in response.");
				}
			} catch (error) {
				console.error("Error fetching trades:", error);
			} finally {
				this.isLoading = false;
			}
		},
		updateViewportHeight() {
			this.viewportHeight = window.innerHeight;
		},
	},
	mounted() {
		this.fetchTradesByDateRange();
		window.addEventListener("resize", this.updateViewportHeight);
	},
	beforeUnmount() {
		window.removeEventListener("resize", this.updateViewportHeight);
	},
};
</script>

<style scoped>
#trades {
	height: 100%;
}
.no-trades {
	font-size: 1.2em;
	color: #666;
	margin-top: 20px;
}

.header {
	display: flex;
	height: 100%;
	width: 100%;
	margin-bottom: 26px;
}
.page-title {
	font-size: 4rem;
}
.date-range-picker {
	display: flex;
	align-items: flex-end;
	gap: 16px;
	background-color: #1e3e62;
	border-radius: 8px;
	padding: 16px;
	width: 100%;
	max-width: 408px;
	box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
	margin-left: 10%;
}

.date-input {
	display: flex;
	flex-direction: column;
}

.date-input label {
	margin-bottom: 4px;
	font-weight: bold;
	color: #eaeaea;
}

.date-input input[type="date"] {
	padding: 8px;
	border: 1px solid #ccc;
	border-radius: 4px;
	font-size: 16px;
	color: #333;
	background-color: #fff;
	width: 180px;
}

.date-input input[type="date"]:focus {
	border-color: #007bff;
	box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
	outline: none;
}

.report {
	width: 100%;
	height: 1000px;
	min-height: 100%;
	display: inline-block;
	align-items: center;
	justify-content: center;
	position: relative;
}
button {
	position: absolute;
	bottom: 10px;
	left: 50%;
	transform: translateX(-50%);
	background-color: #1e3e62;
	color: white;
	border: none;
	padding: 10px 20px;
	border-radius: 8px;
	cursor: pointer;
	font-size: 1rem;
	transition: background-color 0.3s ease;
}

button:hover {
	background-color: #007bff;
}
</style>
