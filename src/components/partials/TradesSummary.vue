<template>
	<div class="trades-summary">
		<!-- Loading trades message -->
		<div v-if="isLoadingTrades" class="loading-message">
			<p>Loading trades...</p>
		</div>

		<!-- No trades available -->
		<div v-else-if="filteredTrades.length === 0" class="no-trades">
			<p>No trades available for the selected account.</p>
		</div>

		<!-- Display trade summary when data is available -->
		<div v-else>
			<div class="table">
				<div class="row header bold">
					<div class="cell nonderline">Trade Summary</div>
					<div class="cell nonderline">{{ filterDate }}</div>
				</div>

				<div class="row">
					<div class="cell nonderline">Total trades</div>
					<div class="cell">{{ totalTrades }}</div>
				</div>
				<div class="row">
					<div class="cell nonderline">Accuracy</div>
					<div class="cell">{{ accuracy.toFixed(2) }}%</div>
				</div>

				<div class="row">
					<div class="cell nonderline">Profit to Loss Ratio</div>
					<div class="cell">{{ profitToLossRatio }}</div>
				</div>
				<div class="row underline">
					<div class="cell">Total Profit/Loss</div>
					<div class="cell">${{ totalProfitLoss.toFixed(2) }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		accountId: {
			type: String,
			required: true,
		},
		filterDate: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			isLoadingTrades: true,
			trades: [], // Initialize trades as an empty array
			hasCorruptData: false,
		};
	},
	mounted() {
		this.fetchTrades();
	},
	watch: {
		accountId(newAccountId, oldAccountId) {
			if (newAccountId !== oldAccountId) {
				this.fetchTrades();
			}
		},
		filterDate(newDate, oldDate) {
			this.fetchTrades();
		},
	},
	computed: {

		filteredTrades() {
			this.hasCorruptData = false;

			const trades = this.trades;

			if (!Array.isArray(trades)) {
				return [];
			}

			const validTrades = trades.filter((trade) => {
				const isValid =
					trade &&
					trade.symbol &&
					trade.accountId &&
					trade.buyPrice !== undefined &&
					trade.sellPrice !== undefined &&
					trade.profitLoss !== undefined &&
					trade.date;

				if (!isValid) this.hasCorruptData = true;

				// Compare accountId as strings to avoid mismatch
				return isValid && String(trade.accountId) === String(this.accountId);
			});

			if (!this.filterDate) return validTrades;

			// Filter by date
			const formattedFilterDate = new Date(this.filterDate).toISOString().split("T")[0];
			const filteredByDate = validTrades.filter((trade) => {
				const formattedTradeDate = new Date(trade.date).toISOString().split("T")[0];
				return formattedFilterDate === formattedTradeDate;
			});

			return filteredByDate;
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
	methods: {
		async fetchTrades() {
			this.isLoadingTrades = true;
			try {
				const fetchedTrades = await this.$store.dispatch("fetchTradesByAccount", this.accountId);
				this.trades = Array.isArray(fetchedTrades) ? fetchedTrades : []; // Ensure trades is always an array
				this.isLoadingTrades = false;
			} catch (error) {
				console.error("Error fetching trades:", error);
				this.isLoadingTrades = false;
				this.trades = []; // In case of error, reset trades to an empty array
			}
		},
	},
};
</script>

<style scoped>
  .table {
	display: table;
	width: 80%;
	margin: 0 auto;
	border-collapse: collapse;
	margin-top: 50px;
  }
  
  .row {
	display: table-row;
	text-align: center;
  }
  
  .cell {
	display: table-cell;
	padding: 10px 20px;
	border-bottom: 1px solid #ccc;
	font-size: 14px;
  }
  
  .bold {
	font-weight: bold;
  }
  .underline {
	border-bottom: 2px solid #333;
  }
  .header .cell {
	font-weight: bold;
	border-bottom: 2px solid #333;
	font-size: 1.3rem;
  }
  
  .nonderline {
	border-bottom: none !important;
  }
  
  .bold .cell {
	border-bottom: 2px solid #000;
	font-size: 16px;
  }
  
  .cell[colspan="3"] {
	text-align: right;
	padding-right: 50px;
	font-weight: bold;
  }
  </style>
