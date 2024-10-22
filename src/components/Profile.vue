<template>
	<div class="trades">
		<h1>Trades Overview</h1>

		<!-- Account Selection -->
		<div>
			<label for="account">Select Account:</label>
			<select v-model="selectedAccountId" @change="fetchTradesByAccount">
				<option disabled value="">Please select an account</option>
				<option v-for="account in userAccounts" :key="account.accountId" :value="account.accountId">
					{{ account.specifications.type }} ({{ account.number }})
				</option>
			</select>
		</div>

		<!-- Date Picker for Filtering -->
		<div class="date-filter">
			<label for="filter-date">Filter by Date:</label>
			<input type="date" id="filter-date" v-model="filterDate" @change="filterTradesByDate" />
		</div>

		<div v-if="isLoading" class="loading-message">
			<p>Loading trades...</p>
		</div>

		<div v-else-if="filteredTrades.length === 0" class="no-trades">
			<p>No trades available for the selected account.</p>
		</div>

		<!-- Corrupt Data Warning -->
		<div v-else-if="hasCorruptData" class="corrupt-data-warning">
			<p>Some trades data is corrupted and could not be displayed. Please contact an administrator.</p>
		</div>

		<div v-else>
			<div class="trades">
				<!-- Other HTML and Vue code -->
				<TradesSummary :totalTrades="totalTrades" :accuracy="accuracy" :profitToLossRatio="profitToLossRatio" :totalProfitLoss="totalProfitLoss" />
				<!-- New Expense Summary Partial -->
				<!-- New Expense Summary Partial -->
				<ExpenseSummary :filterDate="filterDate" :accountId="selectedAccountId" /> <!-- Pass accountId as prop -->


			</div>
		</div>
	</div>
</template>

<script>
import TradesSummary from "./partials/TradesSummary.vue";
import ExpenseSummary from "./partials/ExpenseSummary.vue"; // Import the ExpenseSummary component

export default {
	data() {
		return {
			selectedAccountId: null,
			filterDate: "",
			isLoading: true,
			hasCorruptData: false,
		};
	},
	components: {
		TradesSummary,
		ExpenseSummary
	},
	computed: {
		userAccounts() {
			return this.$store.getters.getUserAccounts;
		},
		trades() {
			const tradesData = this.$store.getters.getTrades;
			return tradesData && Array.isArray(tradesData) ? tradesData : [];
		},
		filteredTrades() {
			this.hasCorruptData = false;

			const validTrades = this.trades.filter((trade) => {
				const isValid =
					trade &&
					trade.symbol &&
					trade.accountId &&
					trade.buyPrice !== undefined &&
					trade.sellPrice !== undefined &&
					trade.profitLoss !== undefined &&
					trade.date;
				if (!isValid) this.hasCorruptData = true;
				return isValid && trade.accountId === this.selectedAccountId; // Filter by selected accountId
			});

			if (!this.filterDate) return validTrades;

			const formattedFilterDate = new Date(this.filterDate).toISOString().split("T")[0];
			return validTrades.filter((trade) => {
				const formattedTradeDate = new Date(trade.date).toISOString().split("T")[0];
				return formattedFilterDate === formattedTradeDate;
			});
		},
		totalProfitLoss() {
			return this.filteredTrades.reduce((total, trade) => total + trade.profitLoss, 0);
		},
		accuracy() {
			const totalTrades = this.filteredTrades.length;
			const wins = this.filteredTrades.filter((trade) => trade.profitLoss > 0).length;
			return totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
		},
		profitToLossRatio() {
			const totalProfit = this.filteredTrades.filter((trade) => trade.profitLoss > 0).reduce((sum, trade) => sum + trade.profitLoss, 0);
			const totalLoss = this.filteredTrades.filter((trade) => trade.profitLoss < 0).reduce((sum, trade) => sum + Math.abs(trade.profitLoss), 0);
			if (totalLoss === 0) return "Infinity";
			return (totalProfit / totalLoss).toFixed(2);
		},
		totalTrades() {
			return this.filteredTrades.length;
		},
	},
	mounted() {
    // Set the first account as the default account if available
    if (this.userAccounts.length > 0) {
      this.selectedAccountId = this.userAccounts[0].accountId; // Set the first account
      this.fetchTradesByAccount(); // Fetch trades for the default account
    }
  },
	methods: {
		async fetchTradesByAccount() {
			this.isLoading = true; // Start loading state
			try {
				// Call the Vuex action to fetch trades by account ID
				await this.$store.dispatch("fetchTradesByAccount", this.selectedAccountId);
				this.isLoading = false; // Stop loading state
			} catch (error) {
				this.isLoading = false; // Stop loading state in case of error
				console.error("Error fetching trades:", error);
			}
		},
	},
};
</script>

<style scoped>
.trades {
	padding: 20px;
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
