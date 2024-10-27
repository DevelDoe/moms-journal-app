<!-- ./src/components/Reports.vue -->
<template>
	<div class="trades">
		<h1>Reports</h1>

		<div class="date-range-picker">
			<label>Start Date:</label>
			<input type="date" v-model="startDate" />
			<label>End Date:</label>
			<input type="date" v-model="endDate" />
			<button @click="fetchTradesByDateRange">Fetch Trades</button>
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
			<!-- <TradesSummary :totalTrades="totalTrades" :accuracy="accuracy" :profitToLossRatio="profitToLossRatio" :totalProfitLoss="totalProfitLoss" /> -->

			<!-- WebSocket Analyze Component -->
			<!-- <AnalyzeTrades v-if="filteredTrades && historicalTrades" :todayTrades="filteredTrades" :historicalTrades="historicalTrades" /> -->

			<ReportCumulativeProfit :trades="trades" />

			<ReportTradesProfit :trades="trades" />

			<ReportProfitLossDistribution :trades="trades" />

			<!-- Trades by Hour Chart Partial -->
			<!-- <ReportTradesByHour
				v-if="tradesByHourChartData.labels.length > 0 && tradesByHourChartData.data.length > 0"
				:labels="tradesByHourChartData.labels"
				:data="tradesByHourChartData.data"
			/> -->

			<!-- Trades by Minute Chart Partial -->
			<!-- <ReportTradesByMinuteChart
				v-if="tradesByMinuteChartData.labels.length > 0 && tradesByMinuteChartData.data.length > 0"
				:labels="tradesByMinuteChartData.labels"
				:data="tradesByMinuteChartData.data"
			/> -->

			<!-- Profit by Whole Dollar Range Chart -->
			<!-- <ReportProfitByPriceRange
				v-if="profitByWholeDollarRangeChartData.labels.length > 0 && profitByWholeDollarRangeChartData.data.length > 0"
				:labels="profitByWholeDollarRangeChartData.labels"
				:data="profitByWholeDollarRangeChartData.data"
			/> -->

			<!-- Trades List Partial -->
			<!-- <TradesList :trades="filteredTrades" :totalProfitLoss="totalProfitLoss" /> -->
		</div>
	</div>
</template>

<script>
import AnalyzeTrades from "./partials/AnalyzeTrades.vue"; // Import the AnalyzeTrades component
import TradesSummary from "./partials/TradesSummary.vue"; // Import the new component
import TradesList from "./partials/TradesList.vue"; // Import the new TradesList component

import ReportCumulativeProfit from "./partials/reports/ReportCumulativeProfit.vue";
import ReportTradesProfit from "./partials/reports/ReportTradesProfit.vue";
import ReportProfitLossDistribution from "./partials/reports/ReportProfitLossDistribution.vue"; // Import the ProfitLossHistogram component

import ReportProfitByPriceRange from "./partials/reports/ReportProfitByPriceRange.vue"; // Import the new ProfitByPriceRangeChart component
import ReportTradesByHour from "./partials/reports/ReportTradesByHour.vue"; // Import the new TradesByHourChart component
import ReportTradesByMinute from "./partials/reports/ReportTradesByMinute.vue"; // Import the TradesByMinuteChart component

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
			hasCorruptData: false,
			startDate: "", // Start date for filtering
			endDate: "", // End date for filtering
			trades: [],
		};
	},
	components: {
		// AnalyzeTrades,
		// TradesSummary,
		VChart,
		// TradesList,
		ReportCumulativeProfit,
		ReportTradesProfit,
		ReportProfitLossDistribution,
		// ReportProfitByPriceRange,
		// ReportTradesByHour,
		// ReportTradesByMinute,
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
	// computed: {
	// 	// Fetch the summaries from Vuex store
	// 	summaries() {
	// 		return this.$store.getters.getSummaries || {};
	// 	},
	// 	// Total Profit/Loss (sum of all profits and losses)
	// 	totalProfitLoss() {
	// 		return this.filteredTrades.reduce((total, trade) => total + trade.profitLoss, 0);
	// 	},
	// 	// Accuracy: percentage of winning trades
	// 	accuracy() {
	// 		const totalTrades = this.filteredTrades.length;
	// 		const wins = this.filteredTrades.filter((trade) => trade.profitLoss > 0).length;
	// 		return totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
	// 	},
	// 	// Profit-to-Loss Ratio: total profit divided by total loss
	// 	profitToLossRatio() {
	// 		const totalProfit = this.filteredTrades.filter((trade) => trade.profitLoss > 0).reduce((sum, trade) => sum + trade.profitLoss, 0);
	// 		const totalLoss = this.filteredTrades.filter((trade) => trade.profitLoss < 0).reduce((sum, trade) => sum + Math.abs(trade.profitLoss), 0);
	// 		if (totalLoss === 0) return "Infinity";
	// 		return (totalProfit / totalLoss).toFixed(2);
	// 	},
	// 	// Number of winning trades
	// 	wins() {
	// 		return this.filteredTrades.filter((trade) => trade.profitLoss > 0).length;
	// 	},
	// 	// Number of losing trades
	// 	losses() {
	// 		return this.filteredTrades.filter((trade) => trade.profitLoss < 0).length;
	// 	},
	// 	// Total number of trades
	// 	totalTrades() {
	// 		return this.filteredTrades.length;
	// 	},
	// 	// Your computed properties here (e.g., filteredTrades, tradesByHour)
	// 	// Calculate trades by hour and determine active hours range
	// 	tradesByHour() {
	// 		if (this.filteredTrades.length === 0) {
	// 			return { minHour: 0, maxHour: 23, tradesByHour: Array(24).fill(0) }; // Default if no trades
	// 		}

	// 		let minHour = 23;
	// 		let maxHour = 0;
	// 		const tradesByHour = Array(24).fill(0); // Initialize 24-hour slots

	// 		// Aggregate trades by hour and find min and max hours with activity
	// 		this.filteredTrades.forEach((trade) => {
	// 			if (trade && trade.date && trade.profitLoss !== undefined) {
	// 				const tradeHour = new Date(trade.date).getHours();
	// 				tradesByHour[tradeHour] += trade.profitLoss;

	// 				if (tradeHour < minHour) minHour = tradeHour;
	// 				if (tradeHour > maxHour) maxHour = tradeHour;
	// 			}
	// 		});

	// 		return { minHour, maxHour, tradesByHour };
	// 	},
	// 	// Format trades by hour chart data for active hours only
	// 	tradesByHourChartData() {
	// 		const { minHour, maxHour, tradesByHour } = this.tradesByHour;

	// 		// Extract only active hours and their corresponding data
	// 		return {
	// 			labels: Array.from({ length: maxHour - minHour + 1 }, (_, i) => `${i + minHour}:00`),
	// 			data: tradesByHour.slice(minHour, maxHour + 1),
	// 		};
	// 	},
	// 	// Calculate trades by minute for a detailed view
	// 	tradesByMinute() {
	// 		if (this.filteredTrades.length === 0) {
	// 			return { minMinute: 0, maxMinute: 1439, tradesByMinute: Array(1440).fill(0) }; // Default to full day if no trades
	// 		}

	// 		let minMinute = 1439;
	// 		let maxMinute = 0;
	// 		const tradesByMinute = Array(1440).fill(0); // Initialize array for 1440 minutes

	// 		// Aggregate trades by minute and determine min and max minute with activity
	// 		this.filteredTrades.forEach((trade) => {
	// 			if (trade && trade.date && trade.profitLoss !== undefined) {
	// 				const date = new Date(trade.date);
	// 				const tradeMinute = date.getHours() * 60 + date.getMinutes(); // Convert to minutes from start of day
	// 				tradesByMinute[tradeMinute] += trade.profitLoss;

	// 				if (tradeMinute < minMinute) minMinute = tradeMinute;
	// 				if (tradeMinute > maxMinute) maxMinute = tradeMinute;
	// 			}
	// 		});

	// 		return { minMinute, maxMinute, tradesByMinute };
	// 	},
	// 	// Format the data to be used in the chart, only for active minute range
	// 	tradesByMinuteChartData() {
	// 		const { minMinute, maxMinute, tradesByMinute } = this.tradesByMinute;

	// 		// Extract only active minutes and their corresponding data
	// 		return {
	// 			labels: Array.from({ length: maxMinute - minMinute + 1 }, (_, i) => {
	// 				const totalMinutes = i + minMinute;
	// 				const hours = Math.floor(totalMinutes / 60)
	// 					.toString()
	// 					.padStart(2, "0");
	// 				const minutes = (totalMinutes % 60).toString().padStart(2, "0");
	// 				return `${hours}:${minutes}`;
	// 			}),
	// 			data: tradesByMinute.slice(minMinute, maxMinute + 1),
	// 		};
	// 	},
	// 	profitByWholeDollarRange() {
	// 		if (this.filteredTrades.length === 0) {
	// 			return {}; // Return an empty object if there are no trades
	// 		}

	// 		// Determine the minimum and maximum buy prices
	// 		const minPrice = Math.floor(Math.min(...this.filteredTrades.map((trade) => trade.buyPrice)));
	// 		const maxPrice = Math.ceil(Math.max(...this.filteredTrades.map((trade) => trade.buyPrice)));

	// 		// Initialize ranges object for every whole dollar value between minPrice and maxPrice
	// 		const ranges = {};
	// 		for (let price = minPrice; price <= maxPrice; price++) {
	// 			ranges[price] = 0; // Initialize profit/loss at 0
	// 		}

	// 		// Aggregate profit/loss for each whole dollar price range
	// 		this.filteredTrades.forEach((trade) => {
	// 			if (trade && trade.buyPrice !== undefined) {
	// 				const roundedPrice = Math.floor(trade.buyPrice); // Round down to the nearest whole dollar
	// 				if (ranges.hasOwnProperty(roundedPrice)) {
	// 					ranges[roundedPrice] += trade.profitLoss;
	// 				}
	// 			}
	// 		});

	// 		return ranges;
	// 	},
	// 	profitByWholeDollarRangeChartData() {
	// 		const rangeData = this.profitByWholeDollarRange;
	// 		return {
	// 			labels: Object.keys(rangeData).length > 0 ? Object.keys(rangeData) : [],
	// 			data: Object.values(rangeData).length > 0 ? Object.values(rangeData) : [],
	// 		};
	// 	},
	// 	// Calculate Profit/Loss Distribution for histogram buckets
	// },
	methods: {
		async fetchTradesByDateRange(start = null, end = null) {
			try {
				await this.$store.dispatch("fetchTrades", { start, end });

				// After fetching, you can validate or filter the data here if needed
				this.hasCorruptData = false;

				const tradesData = this.$store.getters.getTrades || [];
				this.filteredTrades = tradesData.filter((trade) => {
					const isValid =
						trade && trade.symbol && trade.buyPrice !== undefined && trade.sellPrice !== undefined && trade.profitLoss !== undefined && trade.date;

					if (!isValid) {
						this.hasCorruptData = true; // Mark if there's corrupt data
						return false;
					}

					// Additional filter by `filterDate` if it's set
					if (this.filterDate) {
						const formattedFilterDate = new Date(this.filterDate).toISOString().split("T")[0];
						const formattedTradeDate = new Date(trade.date).toISOString().split("T")[0];
						return formattedFilterDate === formattedTradeDate;
					}

					return true;
				});
			} catch (error) {
				console.error("Error fetching trades:", error);
			}
		},
		// Fetch summaries from Vuex store
		async fetchSummaries() {
			try {
				await this.$store.dispatch("fetchAllSummaries");
			} catch (error) {
				console.error("Error fetching summaries:", error);
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
