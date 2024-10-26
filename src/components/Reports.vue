<!-- ./src/components/Reports.vue -->
<template>
	<div class="trades">
		<h1>Reports</h1>

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
			<!-- <TradesSummary :totalTrades="totalTrades" :accuracy="accuracy" :profitToLossRatio="profitToLossRatio" :totalProfitLoss="totalProfitLoss" /> -->

			<!-- WebSocket Analyze Component -->
			<!-- <AnalyzeTrades v-if="filteredTrades && historicalTrades" :todayTrades="filteredTrades" :historicalTrades="historicalTrades" /> -->

			<ReportCumulativeProfit :trades="filteredTrades" />

			<ReportTradesProfit :trades="filteredTrades" />

			<!-- Profit/Loss Distribution Histogram -->
			<!-- <ReportProfitLossHistogram
				v-if="profitLossDistributionChartData.labels.length > 0 && profitLossDistributionChartData.data.length > 0"
				:labels="profitLossDistributionChartData.labels"
				:data="profitLossDistributionChartData.data"
			/> -->

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
import ReportProfitByPriceRange from "./partials/reports/ReportProfitByPriceRange.vue"; // Import the new ProfitByPriceRangeChart component
import ReportTradesByHour from "./partials/reports/ReportTradesByHour.vue"; // Import the new TradesByHourChart component
import ReportTradesByMinute from "./partials/reports/ReportTradesByMinute.vue"; // Import the TradesByMinuteChart component
import ReportProfitLossHistogram from "./partials/reports/ReportProfitLossHistogram.vue"; // Import the ProfitLossHistogram component

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
		};
	},
	components: {
		AnalyzeTrades,
		TradesSummary,
		VChart,
		// TradesList,
		ReportCumulativeProfit,
		ReportTradesProfit,
		// ReportProfitByPriceRange,
		// ReportTradesByHour,
		// ReportTradesByMinute,
		// ReportProfitLossHistogram,
	},
	async mounted() {
		// Fetch trades and historical trades when the component is mounted
		await this.fetchTrades();
		// await this.fetchHistoricalTrades();
		// await this.fetchSummaries();
		this.isLoading = false;
	},
	computed: {
		trades() {
			const tradesData = this.$store.getters.getTrades;
			return tradesData && Array.isArray(tradesData) ? tradesData : [];
		},
		filteredTrades() {
			this.hasCorruptData = false; // Reset corrupt data flag

			// Shallow unwrap each trade object using spread syntax
			const tradesArray = this.trades.map((trade) => ({ ...trade }));

			const validTrades = tradesArray.filter((trade) => {
				const isValid =
					trade && trade.symbol && trade.buyPrice !== undefined && trade.sellPrice !== undefined && trade.profitLoss !== undefined && trade.date;

				if (!isValid) {
					this.hasCorruptData = true; // Mark if there's corrupt data
					return false;
				}
				return isValid;
			});

			// If no filter date is selected, return all valid trades
			if (!this.filterDate) {
				return validTrades;
			}

			// Filter trades by selected date if a date is set
			const formattedFilterDate = new Date(this.filterDate).toISOString().split("T")[0];
			return validTrades.filter((trade) => {
				const formattedTradeDate = new Date(trade.date).toISOString().split("T")[0];
				return formattedFilterDate === formattedTradeDate;
			});
		},
		// Fetch the summaries from Vuex store
		summaries() {
			return this.$store.getters.getSummaries || {};
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
		// Calculate trades by hour and determine active hours range
		tradesByHour() {
			if (this.filteredTrades.length === 0) {
				return { minHour: 0, maxHour: 23, tradesByHour: Array(24).fill(0) }; // Default if no trades
			}

			let minHour = 23;
			let maxHour = 0;
			const tradesByHour = Array(24).fill(0); // Initialize 24-hour slots

			// Aggregate trades by hour and find min and max hours with activity
			this.filteredTrades.forEach((trade) => {
				if (trade && trade.date && trade.profitLoss !== undefined) {
					const tradeHour = new Date(trade.date).getHours();
					tradesByHour[tradeHour] += trade.profitLoss;

					if (tradeHour < minHour) minHour = tradeHour;
					if (tradeHour > maxHour) maxHour = tradeHour;
				}
			});

			return { minHour, maxHour, tradesByHour };
		},
		// Format trades by hour chart data for active hours only
		tradesByHourChartData() {
			const { minHour, maxHour, tradesByHour } = this.tradesByHour;

			// Extract only active hours and their corresponding data
			return {
				labels: Array.from({ length: maxHour - minHour + 1 }, (_, i) => `${i + minHour}:00`),
				data: tradesByHour.slice(minHour, maxHour + 1),
			};
		},
		// Calculate trades by minute for a detailed view
		tradesByMinute() {
			if (this.filteredTrades.length === 0) {
				return { minMinute: 0, maxMinute: 1439, tradesByMinute: Array(1440).fill(0) }; // Default to full day if no trades
			}

			let minMinute = 1439;
			let maxMinute = 0;
			const tradesByMinute = Array(1440).fill(0); // Initialize array for 1440 minutes

			// Aggregate trades by minute and determine min and max minute with activity
			this.filteredTrades.forEach((trade) => {
				if (trade && trade.date && trade.profitLoss !== undefined) {
					const date = new Date(trade.date);
					const tradeMinute = date.getHours() * 60 + date.getMinutes(); // Convert to minutes from start of day
					tradesByMinute[tradeMinute] += trade.profitLoss;

					if (tradeMinute < minMinute) minMinute = tradeMinute;
					if (tradeMinute > maxMinute) maxMinute = tradeMinute;
				}
			});

			return { minMinute, maxMinute, tradesByMinute };
		},
		// Format the data to be used in the chart, only for active minute range
		tradesByMinuteChartData() {
			const { minMinute, maxMinute, tradesByMinute } = this.tradesByMinute;

			// Extract only active minutes and their corresponding data
			return {
				labels: Array.from({ length: maxMinute - minMinute + 1 }, (_, i) => {
					const totalMinutes = i + minMinute;
					const hours = Math.floor(totalMinutes / 60)
						.toString()
						.padStart(2, "0");
					const minutes = (totalMinutes % 60).toString().padStart(2, "0");
					return `${hours}:${minutes}`;
				}),
				data: tradesByMinute.slice(minMinute, maxMinute + 1),
			};
		},
		profitByWholeDollarRange() {
			if (this.filteredTrades.length === 0) {
				return {}; // Return an empty object if there are no trades
			}

			// Determine the minimum and maximum buy prices
			const minPrice = Math.floor(Math.min(...this.filteredTrades.map((trade) => trade.buyPrice)));
			const maxPrice = Math.ceil(Math.max(...this.filteredTrades.map((trade) => trade.buyPrice)));

			// Initialize ranges object for every whole dollar value between minPrice and maxPrice
			const ranges = {};
			for (let price = minPrice; price <= maxPrice; price++) {
				ranges[price] = 0; // Initialize profit/loss at 0
			}

			// Aggregate profit/loss for each whole dollar price range
			this.filteredTrades.forEach((trade) => {
				if (trade && trade.buyPrice !== undefined) {
					const roundedPrice = Math.floor(trade.buyPrice); // Round down to the nearest whole dollar
					if (ranges.hasOwnProperty(roundedPrice)) {
						ranges[roundedPrice] += trade.profitLoss;
					}
				}
			});

			return ranges;
		},
		profitByWholeDollarRangeChartData() {
			const rangeData = this.profitByWholeDollarRange;
			return {
				labels: Object.keys(rangeData).length > 0 ? Object.keys(rangeData) : [],
				data: Object.values(rangeData).length > 0 ? Object.values(rangeData) : [],
			};
		},
		// Calculate Profit/Loss Distribution for histogram buckets
		profitLossDistribution() {
			if (this.filteredTrades.length === 0) {
				return {}; // No trades, no distribution data
			}

			// Define the specific bucket ranges to cover both losses and profits using expanded Fibonacci numbers
			const bucketRanges = [
				{ label: "Below -$987", min: -Infinity, max: -987 },
				{ label: "-$987 to -$610", min: -987, max: -610 },
				{ label: "-$610 to -$377", min: -610, max: -377 },
				{ label: "-$377 to -$233", min: -377, max: -233 },
				{ label: "-$233 to -$144", min: -233, max: -144 },
				{ label: "-$144 to -$89", min: -144, max: -89 },
				{ label: "-$89 to -$55", min: -89, max: -55 },
				{ label: "-$55 to -$34", min: -55, max: -34 },
				{ label: "-$34 to -$21", min: -34, max: -21 },
				{ label: "-$21 to -$13", min: -21, max: -13 },
				{ label: "-$13 to -$8", min: -13, max: -8 },
				{ label: "-$8 to -$5", min: -8, max: -5 },
				{ label: "-$5 to -$3", min: -5, max: -3 },
				{ label: "-$3 to -$2", min: -3, max: -2 },
				{ label: "-$2 to $0", min: -2, max: 0 },
				{ label: "$0 to $2", min: 0, max: 2 },
				{ label: "$2 to $3", min: 2, max: 3 },
				{ label: "$3 to $5", min: 3, max: 5 },
				{ label: "$5 to $8", min: 5, max: 8 },
				{ label: "$8 to $13", min: 8, max: 13 },
				{ label: "$13 to $21", min: 13, max: 21 },
				{ label: "$21 to $34", min: 21, max: 34 },
				{ label: "$34 to $55", min: 34, max: 55 },
				{ label: "$55 to $89", min: 55, max: 89 },
				{ label: "$89 to $144", min: 89, max: 144 },
				{ label: "$144 to $233", min: 144, max: 233 },
				{ label: "$233 to $377", min: 233, max: 377 },
				{ label: "$377 to $610", min: 377, max: 610 },
				{ label: "$610 to $987", min: 610, max: 987 },
				{ label: "Above $987", min: 987, max: Infinity },
			];

			// Initialize the buckets
			const buckets = {};
			bucketRanges.forEach((range) => {
				buckets[range.label] = 0; // Start each bucket with a count of 0
			});

			// Count the trades in each bucket
			this.filteredTrades.forEach((trade) => {
				if (trade && trade.profitLoss !== undefined) {
					const profitLoss = trade.profitLoss;
					// Find the correct bucket for each trade
					const bucket = bucketRanges.find((range) => profitLoss >= range.min && profitLoss < range.max);
					if (bucket) {
						buckets[bucket.label]++;
					}
				}
			});

			return buckets;
		},
		profitLossDistributionChartData() {
			const distribution = this.profitLossDistribution;
			return {
				labels: Object.keys(distribution),
				data: Object.values(distribution),
			};
		},

		tradeProfitAndTradeCountData() {
			if (this.filteredTrades.length === 0) {
				return { labels: [], profitData: [], tradeCountData: [] }; // No trades available
			}

			// Sort the trades by date
			const sortedTrades = [...this.filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date));

			const isSingleDay = this.filterDate !== ""; // Determine if filtering to a specific day

			const labels = [];
			const profitData = [];
			const tradeCountData = [];

			if (isSingleDay) {
				// Group trades by hour for the filtered day
				const tradesByHour = sortedTrades.reduce((acc, trade) => {
					const date = new Date(trade.date);
					const hourKey = `${date.getHours()}:00`; // e.g., '14:00'
					if (!acc[hourKey]) {
						acc[hourKey] = [];
					}
					acc[hourKey].push(trade);
					return acc;
				}, {});

				// Prepare labels and data for the chart
				Object.keys(tradesByHour).forEach((hour) => {
					const trades = tradesByHour[hour];
					labels.push(hour);

					// Calculate total profit for the hour
					const hourlyProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
					profitData.push(hourlyProfit);

					// Number of trades in this hour
					tradeCountData.push(trades.length);
				});
			} else {
				// Group trades by day
				const tradesByDay = sortedTrades.reduce((acc, trade) => {
					const dateKey = new Date(trade.date).toLocaleDateString();
					if (!acc[dateKey]) {
						acc[dateKey] = [];
					}
					acc[dateKey].push(trade);
					return acc;
				}, {});

				// Prepare labels and data for the chart
				Object.keys(tradesByDay).forEach((date) => {
					const trades = tradesByDay[date];
					labels.push(date);

					// Calculate total profit for the day
					const tradeProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
					profitData.push(tradeProfit);

					// Number of trades on this day
					tradeCountData.push(trades.length);
				});
			}

			return {
				labels,
				profitData,
				tradeCountData,
			};
		},
		tradeProfitLabels() {
			return this.tradeProfitAndTradeCountData.labels;
		},
		tradeProfitValues() {
			return this.tradeProfitAndTradeCountData.profitData;
		},
		tradeTradeCountValues() {
			return this.tradeProfitAndTradeCountData.tradeCountData;
		},
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
