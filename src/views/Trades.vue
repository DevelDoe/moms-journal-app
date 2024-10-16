<template>
	<div class="trades">
		<h1>Trades Overview</h1>
		<button @click="fetchTrades">Fetch Trades</button>

		<button @click="analizeTrades">Analyze</button>
		<p>{{ gptResponse }}</p>
	</div>

	<!-- Date Picker for Filtering -->
	<div class="date-filter">
		<label for="filter-date">Filter by Date:</label>
		<input
			type="date"
			id="filter-date"
			v-model="filterDate"
			@change="filterTradesByDate"
		/>
	</div>

	<!-- Loading and No Trades Messages -->
	<div v-if="isLoading" class="loading-message">
		<p>Loading trades...</p>
	</div>
	<div v-else-if="filteredTrades.length === 0" class="no-trades">
		<p>No trades available for the selected date.</p>
	</div>
	<div v-else>
		<!-- Summary Section -->
		<h2>Trades Summary</h2>
		<div class="trades-summary">
			<p>Total Trades: {{ totalTrades }}</p>
			<p>Accuracy: {{ accuracy.toFixed(2) }}%</p>
			<p>Profit to Loss Ratio: {{ profitToLossRatio }}</p>
			<p>Total Profit/Loss: ${{ totalProfitLoss.toFixed(2) }}</p>
		</div>

		<!-- Trades Table -->
		<h2>Trades List</h2>
		<table class="trades-table">
			<thead>
				<tr>
					<th>Symbol</th>
					<th>Account</th>
					<th>Quantity</th>
					<th>Buy Price</th>
					<th>Sell Price</th>
					<th>Side</th>
					<th>Profit/Loss</th>
					<th>Date</th>
					<th>Time</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="(trade, index) in filteredTrades"
					:key="index"
					:class="{
						profit: trade.profitLoss > 0,
						loss: trade.profitLoss < 0,
					}"
				>
					<td>{{ trade.symbol }}</td>
					<td>{{ trade.account }}</td>
					<td>{{ trade.quantity }}</td>
					<td>{{ trade.buyPrice.toFixed(2) }}</td>
					<td>{{ trade.sellPrice.toFixed(2) }}</td>
					<td>{{ trade.side }}</td>
					<td>{{ trade.profitLoss.toFixed(2) }}</td>
					<td>{{ new Date(trade.date).toLocaleDateString() }}</td>
					<td>{{ new Date(trade.date).toLocaleTimeString() }}</td>
				</tr>
			</tbody>
			<tfoot>
				<tr>
					<td colspan="8" class="total-label">Total P/L</td>
					<td class="total-value">
						${{ totalProfitLoss.toFixed(2) }}
					</td>
				</tr>
			</tfoot>
		</table>
	</div>
</template>


<script>
export default {
  data() {
    return {
      filterDate: "", // Stores the selected date for filtering
      isLoading: true, // Loading state
      tradesLoaded: false, // Ensure trades are loaded before filtering
      socket: null, // WebSocket instance
      gptResponse: "", // Store the AI analysis from the WebSocket server
    };
  },
  async created() {
    // Fetch trades when the component is created
    await this.fetchTrades();
    this.isLoading = false;
  },
  computed: {
    // Retrieve trades from Vuex store
    trades() {
      const tradesData = this.$store.getters.getTrades;
      return tradesData && Array.isArray(tradesData.trades)
        ? tradesData.trades
        : [];
    },
    // Filter trades based on the selected date
    filteredTrades() {
      if (!this.tradesLoaded) {
        return [];
      }
      if (!this.filterDate) {
        return this.trades;
      }
      const formattedFilterDate = new Date(this.filterDate)
        .toISOString()
        .split("T")[0];
      return this.trades.filter((trade) => {
        const formattedTradeDate = new Date(trade.date)
          .toISOString()
          .split("T")[0];
        return formattedFilterDate === formattedTradeDate;
      });
    },
    totalProfit() {
    return this.filteredTrades
      .filter((trade) => trade.profitLoss > 0)
      .reduce((sum, trade) => sum + trade.profitLoss, 0);
  },

  totalLoss() {
    return Math.abs(
      this.filteredTrades
        .filter((trade) => trade.profitLoss < 0)
        .reduce((sum, trade) => sum + trade.profitLoss, 0)
    );
  },

  totalProfitLoss() {
    return this.totalProfit - this.totalLoss;
  },

  accuracy() {
    const totalTrades = this.filteredTrades.length;
    return totalTrades > 0 ? (this.wins / totalTrades) * 100 : 0;
  },

  profitToLossRatio() {
    const totalProfit = this.totalProfit;
    const totalLoss = this.totalLoss;
    // If there's no loss, return "Infinity", otherwise compute the ratio
    return totalLoss === 0 ? "Infinity" : (totalProfit / totalLoss).toFixed(2);
  },

  wins() {
    return this.filteredTrades.filter((trade) => trade.profitLoss > 0).length;
  },

  losses() {
    return this.filteredTrades.filter((trade) => trade.profitLoss < 0).length;
  },

  totalTrades() {
    return this.filteredTrades.length;
  },
  methods: {
    // Fetch trades from Vuex store
    async fetchTrades() {
      try {
        await this.$store.dispatch("fetchTrades");
      } catch (error) {
        console.error("Error fetching trades:", error);
      }
    },
    
    // Create a summary for the trades and send it to the WebSocket server
    createTradeSummary() {
      const totalTrades = this.filteredTrades.length;
      const totalProfit = this.filteredTrades
        .filter((trade) => trade.profitLoss > 0)
        .reduce((sum, trade) => sum + trade.profitLoss, 0);
      const totalLoss = this.filteredTrades
        .filter((trade) => trade.profitLoss < 0)
        .reduce((sum, trade) => sum + trade.profitLoss, 0);
      const winRate = totalTrades > 0 ? (this.wins / totalTrades) * 100 : 0;
      const profitToLossRatio =
        totalLoss === 0
          ? "Infinity"
          : (totalProfit / Math.abs(totalLoss)).toFixed(2);

      return {
        totalTrades,
        totalProfitLoss: this.totalProfitLoss.toFixed(2),
        winRate: winRate.toFixed(2),
        profitToLossRatio,
        totalProfit: totalProfit.toFixed(2),
        totalLoss: Math.abs(totalLoss).toFixed(2)
      };
    },

    // Helper function to get a random subset of trades
    getRandomTrades(trades, count) {
      // Shuffle the trades array and return a subset
      const shuffled = trades.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    },

    // WebSocket integration to analyze trades
    analizeTrades() {
      // Check if the socket is already connected
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        this.socket = new WebSocket("wss://localhost:4000");

        this.socket.onopen = () => {
          console.log("Connected to WebSocket server.");

          // Send a summary of the trades
          const tradeSummary = this.createTradeSummary();

          // Send a random subset of 10 trades (or any desired number)
          const randomSubset = this.getRandomTrades(this.filteredTrades, 10);

          // Combine the summary and random subset into a single object
          const dataToSend = {
            tradeSummary,
            randomSubset
          };

          // Send the data to the backend via WebSocket
          this.socket.send(JSON.stringify(dataToSend));
        };

        this.socket.onmessage = (event) => {
          console.log("Received analysis from server:", event.data);
          this.gptResponse = event.data; // Display the AI response
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket Error:", error);
        };

        this.socket.onclose = () => {
          console.log("WebSocket connection closed.");
        };
      } else {
        // Send the summary of trades if socket is already open
        const tradeSummary = this.createTradeSummary();
        const randomSubset = this.getRandomTrades(this.filteredTrades, 10);

        const dataToSend = {
          tradeSummary,
          randomSubset
        };
        this.socket.send(JSON.stringify(dataToSend));
      }
    }
  },
  watch: {
    trades: {
      immediate: true,
      handler(newTrades) {
        if (newTrades && newTrades.length > 0) {
          this.tradesLoaded = true;
        } else {
          this.tradesLoaded = false;
        }
      }
    }
  }
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
