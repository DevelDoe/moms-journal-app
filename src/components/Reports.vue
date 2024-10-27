<!-- ./src/components/Reports.vue -->
<template>
	<div id="trades">
		<div v-if="isLoading" class="loading-message">
			<p>Loading Reports...</p>
		</div>

		<div v-else-if="trades && trades.length === 0" class="no-trades">
			<p>No trades available for the selected date.</p>
		</div>
		<!-- Corrupt Data Warning -->
		<div v-else-if="hasCorruptData" class="corrupt-data-warning">
			<p>Some trades data is corrupted and could not be displayed. Please contact an administrator.</p>
		</div>

		<div v-else>
			<div class="header">
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
			</div>
			<div class="content">
				<ReportCumulativeProfit :trades="trades" />
				<ReportTradesProfit :trades="trades" />
				<ReportProfitLossDistribution :trades="trades" />
			</div>
		</div>
	</div>
</template>

<script>
import ReportCumulativeProfit from "./partials/reports/ReportCumulativeProfit.vue";
import ReportTradesProfit from "./partials/reports/ReportTradesProfit.vue";
import ReportProfitLossDistribution from "./partials/reports/ReportProfitLossDistribution.vue";

export default {
	data() {
		return {
			isLoading: true,
			hasCorruptData: false,
			startDate: "", // Start date for fetching
			endDate: "", // End date for fetching
			trades: [], // Fetched trades directly from backend
		};
	},
	components: {
		ReportCumulativeProfit,
		ReportTradesProfit,
		ReportProfitLossDistribution,
	},
	async mounted() {
		// Calculate the start and end of the current month
		const today = new Date();
		const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
		const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];

		// Fetch trades for the current month by default
		await this.fetchTradesByDateRange(currentMonthStart, currentMonthEnd);
		this.isLoading = false;
	},
	methods: {
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
				// Optional: Display an error message to the user
			} finally {
				this.isLoading = false;
			}
		},
	},
	watch: {
		startDate(newVal) {
			if (newVal && this.endDate) this.fetchTradesByDateRange(newVal, this.endDate);
		},
		endDate(newVal) {
			if (newVal && this.startDate) this.fetchTradesByDateRange(this.startDate, newVal);
		},
	},
};
</script>

<style scoped>
#trades {
	padding: 20px;
}
.header {
	display: flex;
	height: 100%;
	width: 100%;
}
.page-title {
	font-size: 4rem;
}
.date-range-picker {
	display: flex;
	align-items: flex-end;
	gap: 16px; /* Add spacing between the date inputs */
	background-color: #1e3e62;
	border-radius: 8px;
	padding: 16px;
	width: 100%;
	max-width: 600px;
	box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
	font-family: Arial, sans-serif;
}

.date-input {
	display: flex;
	flex-direction: column;
}

.date-input label {
	margin-bottom: 4px;
	font-weight: bold;
	color: #333;
}

.date-input input[type="date"] {
	padding: 8px;
	border: 1px solid #ccc;
	border-radius: 4px;
	font-size: 16px;
	color: #333;
	background-color: #fff;
	width: 180px; /* Fixed width to keep both inputs aligned */
}

.date-input input[type="date"]:focus {
	border-color: #007bff;
	box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
	outline: none;
}
.no-trades {
	font-size: 1.2em;
	color: #666;
	margin-top: 20px;
}
</style>
