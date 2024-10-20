<template>
	<div class="trades">
		<h1>Trades Overview</h1>

		<!-- Date Picker for Filtering -->
		<div class="date-filter">
			<label for="filter-date">Filter by Date:</label>
			<input type="date" id="filter-date" v-model="filterDate" @change="filterTradesByDate" />
		</div>

		<div v-if="isLoading" class="loading-message">
			<p>Loading trades...</p>
		</div>
		
		<div v-else-if="filteredTrades.length === 0" class="no-trades">
			<p>No trades available for the selected date.</p>
		</div>
		
		<!-- Corrupt Data Warning -->
		<div v-else-if="hasCorruptData" class="corrupt-data-warning">
			<p>Some trades data is corrupted and could not be displayed. Please contact an administrator.</p>
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

			<!-- WebSocket Analyze Component -->
			<AnalyzeTrades v-if="filteredTrades && historicalTrades" :todayTrades="filteredTrades" :historicalTrades="historicalTrades" />

			<!-- Bar Chart for Trades by Hour -->
			<v-chart :option="chartOptions" autoresize style="width: 100%; height: 400px"></v-chart>

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
					<tr v-for="(trade, index) in filteredTrades" :key="index">
						<td>{{ trade.symbol || "N/A" }}</td>
						<td>{{ trade.account || "N/A" }}</td>
						<td>{{ trade.quantity !== undefined ? trade.quantity : "N/A" }}</td>
						<td>{{ trade.buyPrice !== undefined ? trade.buyPrice.toFixed(2) : "N/A" }}</td>
						<td>{{ trade.sellPrice !== undefined ? trade.sellPrice.toFixed(2) : "N/A" }}</td>
						<td>{{ trade.side || "N/A" }}</td>
						<td>{{ trade.profitLoss !== undefined ? trade.profitLoss.toFixed(2) : "N/A" }}</td>
						<td>{{ trade.date ? new Date(trade.date).toLocaleDateString() : "Invalid Date" }}</td>
						<td>{{ trade.date ? new Date(trade.date).toLocaleTimeString() : "Invalid Time" }}</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td colspan="8" class="total-label">Total P/L</td>
						<td class="total-value">${{ totalProfitLoss.toFixed(2) }}</td>
					</tr>
				</tfoot>
			</table>
		</div>
	</div>
</template>

<script>
import AnalyzeTrades from "./partials/AnalyzeTrades.vue"; // Import the AnalyzeTrades component
import axios from "axios"; // Make sure axios is imported
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent]);

export default {
	data() {
		return {
			filterDate: "", // Stores the selected date for filtering
			isLoading: true, // Loading state
			tradesLoaded: false, // Ensure trades are loaded before filtering
			socket: null, // WebSocket instance
			gptResponse: "", // Store the AI analysis from the WebSocket server
			rawFilteredTrades: [], // Rename this property
			historicalTrades: [], // Historical trades
			username: "",
			hasCorruptData: false,
		};
	},
	components: {
		AnalyzeTrades,
		VChart,
	},
	async mounted() {
		// Fetch orders and trades when the component is mounted
		await this.fetchOrders();
		await this.fetchTrades();
		await this.fetchHistoricalTrades();
		console.log(this.historicalTrades);
		this.isLoading = false;
	},
	computed: {
		trades() {
			const tradesData = this.$store.getters.getTrades;
			return tradesData && Array.isArray(tradesData) ? tradesData : [];
		},

		// Filter trades by selected date
		filteredTrades() {
			this.hasCorruptData = false; // Reset the flag

			if (!this.tradesLoaded) return [];

			const validTrades = this.trades.filter((trade) => {
				const isValid =
					trade &&
					trade.symbol &&
					trade.account &&
					trade.buyPrice !== undefined &&
					trade.sellPrice !== undefined &&
					trade.profitLoss !== undefined &&
					trade.date;
				if (!isValid) this.hasCorruptData = true; // Mark if corrupted data found
				return isValid;
			});

			if (!this.filterDate) return validTrades;

			const formattedFilterDate = new Date(this.filterDate).toISOString().split("T")[0];
			return validTrades.filter((trade) => {
				const formattedTradeDate = new Date(trade.date).toISOString().split("T")[0];
				return formattedFilterDate === formattedTradeDate;
			});
		},

		// Total Profit/Loss (sum of all profits and losses)
		totalProfitLoss() {
			return this.filteredTrades.reduce((total, trade) => total + trade.profitLoss, 0);
		},

		// Accuracy: percentage of winning trades
		accuracy() {
			const totalTrades = this.filteredTrades.length;
			const wins = this.filteredTrades.filter((trade) => trade.profitLoss > 0).length;
			return totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
		},

		// Profit-to-Loss Ratio: total profit divided by total loss
		profitToLossRatio() {
			const totalProfit = this.filteredTrades.filter((trade) => trade.profitLoss > 0).reduce((sum, trade) => sum + trade.profitLoss, 0);
			const totalLoss = this.filteredTrades.filter((trade) => trade.profitLoss < 0).reduce((sum, trade) => sum + Math.abs(trade.profitLoss), 0);
			if (totalLoss === 0) return "Infinity";
			return (totalProfit / totalLoss).toFixed(2);
		},

		// Number of winning trades
		wins() {
			return this.filteredTrades.filter((trade) => trade.profitLoss > 0).length;
		},

		// Number of losing trades
		losses() {
			return this.filteredTrades.filter((trade) => trade.profitLoss < 0).length;
		},

		// Total number of trades
		totalTrades() {
			return this.filteredTrades.length;
		},
		// Your computed properties here (e.g., filteredTrades, tradesByHour)
		tradesByHour() {
			const tradesByHour = Array(24).fill(0); // 24-hour slots
			this.filteredTrades.forEach((trade) => {
				if (trade && trade.date && trade.profitLoss !== undefined) {
					const tradeHour = new Date(trade.date).getHours();
					tradesByHour[tradeHour] += trade.profitLoss;
				}
			});
			return tradesByHour;
		},
		chartOptions() {
			return {
				title: {
					text: "Trades by Hour",
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "shadow",
					},
				},
				xAxis: {
					type: "category",
					data: Array.from({ length: 24 }, (_, i) => `${i}:00`), // Labels for hours
				},
				yAxis: {
					type: "value",
				},
				series: [
					{
						name: "Profit/Loss",
						type: "bar",
						data: this.tradesByHour,
						itemStyle: {
							color: (params) => (params.value >= 0 ? "#73c0de" : "#e57373"), // Positive: blue, Negative: red
						},
					},
				],
			};
		},
	},
	methods: {
		// Fetch orders from Vuex store
		async fetchOrders() {
			try {
				await this.$store.dispatch("fetchOrders"); // Fetch orders first
			} catch (error) {
				console.error("Error fetching orders:", error);
			}
		},

		// Fetch trades from Vuex store
		async fetchTrades() {
			try {
				await this.$store.dispatch("fetchTrades");
			} catch (error) {
				console.error("Error fetching trades:", error);
			}
		},

		async fetchHistoricalTrades() {
			const token = localStorage.getItem("token");
			try {
				const response = await axios.get("http://localhost:5000/api/orders/historical", {
					headers: { Authorization: `Bearer ${token}` },
				});
				this.historicalTrades = response.data || []; // Assign historical trades to the data property
			} catch (error) {
				console.error("Error fetching historical trades:", error);
			}
		},
	},
	watch: {
		trades: {
			immediate: true,
			handler(newTrades) {
				this.tradesLoaded = newTrades.length > 0; // Set tradesLoaded based on new trades
			},
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
