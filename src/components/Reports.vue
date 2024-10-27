<!-- ./src/components/Reports.vue -->
<template>
	<div id="trades">
		<div class="header">
			<div class="page-title">Reports</div>
		</div>
		

		<div class="date-range-picker">
			<label>Start Date:</label>
			<input type="date" v-model="startDate" />
			<label>End Date:</label>
			<input type="date" v-model="endDate" />
		</div>

		<div v-if="isLoading" class="loading-message">
			<p>Loading trades...</p>
		</div>

		<div v-else-if="trades && trades.length === 0" class="no-trades">
			<p>No trades available for the selected date.</p>
		</div>

		<!-- Corrupt Data Warning -->
		<div v-else-if="hasCorruptData" class="corrupt-data-warning">
			<p>Some trades data is corrupted and could not be displayed. Please contact an administrator.</p>
		</div>

		<div v-else>
			<ReportCumulativeProfit :trades="trades" />

			<ReportTradesProfit :trades="trades" />

			<ReportProfitLossDistribution :trades="trades" />
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
.header{
	display: inline-block;
}
.page-title{
	font-size: 4rem;
	float: left;
	min-width: 200px;
}
.date-range-picker{
	float:right;
}
.date-range-picker {
	display: flex;
    flex-direction: column;
    align-items: start;
    background-color: #1e3e62;
    border-radius: 7px;
    padding: 17px;
    width: 100%;
    max-width: 221px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.date-range-picker label {
	margin-bottom: 4px;
	font-weight: bold;
	color: #eaeaea;
}

.date-range-picker input[type="date"] {
	width: 100%;
    padding: 8px;
    margin-bottom: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 20px;
    color: #333;
    background-color: #ffffff;
}

.date-range-picker input[type="date"]:focus {
	border-color: #007bff;
	box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
	outline: none;
}
.no-trades {
	font-size: 1.2em;
	color: #666;
	margin-top: 20px;
}
.date-filter {
	margin: 20px 0;
}
.trades-table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 20px;
}
th,
td {
	padding: 10px;
	border: 1px solid #ddd;
	text-align: left;
}

th {
	background-color: #f4f4f4;
}

.profit {
	background-color: #ccffcc; /* Light green background for profitable trades */
	color: green;
}

.loss {
	background-color: #ffcccc; /* Light red background for losing trades */
	color: red;
}

tfoot .total-label {
	font-weight: bold;
	text-align: right;
}

tfoot .total-value {
	font-weight: bold;
	text-align: left;
}

.trades-summary {
	margin-top: 20px;
	font-size: 1.1em;
}
</style>
