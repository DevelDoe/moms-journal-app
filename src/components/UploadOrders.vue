<template>
	<div>
		<h2>Import Orders</h2>
		<input type="file" @change="handleFileUpload" accept=".txt" />
		<button @click="importOrders" :disabled="!orders.length">Import Orders</button>

		<!-- Display the cumulative profit report for the uploaded trades -->
		<ReportCumulativeProfit :trades="trades" />

		<!-- Display the list of uploaded orders -->
		<table v-if="orders.length > 0" class="orders-table">
			<thead>
				<tr>
					<th>Symbol</th>
					<th>Time</th>
					<th>Side</th>
					<th>Quantity</th>
					<th>Price</th>
					<th>Date</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="order in orders" :key="order._id" :class="{ buy: order.side === 'buy', sell: order.side === 'sell' }">
					<td>{{ order.symbol }}</td>
					<td>{{ new Date(order.date).toLocaleTimeString() }}</td>
					<td>{{ order.side }}</td>
					<td>{{ order.quantity }}</td>
					<td>${{ order.price.toFixed(4) }}</td>
					<td>{{ new Date(order.date).toLocaleDateString() }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
import ReportCumulativeProfit from "./partials/reports/ReportCumulativeProfit.vue"; // Assuming this is the path

export default {
	components: { ReportCumulativeProfit },
	data() {
		return {
			orders: [], // Store parsed orders
			message: "", // Store success or error messages
		};
	},
	computed: {
		trades() {
			const tradesData = this.$store.getters.getTrades;
			return tradesData && Array.isArray(tradesData) ? tradesData : [];
		},
	},
	methods: {
		// Handle file upload and parse the file
		handleFileUpload(event) {
			const file = event.target.files[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (e) => {
				const text = e.target.result;
				this.parseFileContent(text); // Parse the content
			};
			reader.readAsText(file);
		},
		parseFileContent(content) {
			const lines = content.split("\n").filter((line) => line.trim() !== ""); // Split lines and filter out empty ones

			this.orders = lines
				.map((line) => {
					const trimmedLine = line.trim();
					let parts = trimmedLine.split(",").filter((part) => part !== ""); // Filter out any empty parts

					const dateStr = parts[0]; // Date string
					const timeStr = parts[1]; // Time string
					const symbol = parts[2]; // Symbol
					const side = parts[3]; // Side (BOT or SLD)
					const quantity = parts[4]; // Quantity
					const price = parts.length === 7 ? parseFloat(parts[5]) : parseFloat(`${parts[5]}.${parts[6] || "00"}`); // Price handling

					const dateParts = dateStr.split("/"); // ['08', '10', '24']
					const day = parseInt(dateParts[0], 10).toString().padStart(2, "0");
					const month = parseInt(dateParts[1], 10).toString().padStart(2, "0");
					const year = `20${dateParts[2]}`;

					const isoDateString = `${year}-${month}-${day}T${timeStr}`;
					const date = new Date(isoDateString);

					if (isNaN(date.getTime())) {
						console.error("Date parsing failed for line:", line);
						this.message = "Date parsing failed, please check the file format.";
						return null; // Return null to filter out invalid entries
					}

					return {
						date,
						symbol: symbol.trim(),
						side: side.trim() === "BOT" ? "buy" : "sell",
						quantity: parseInt(quantity.trim(), 10),
						price: price,
					};
				})
				.filter((order) => order !== null); // Filter out any null entries due to parsing errors
		},
		// Send parsed orders to the backend
		async importOrders() {
			try {
				// Dispatch the action and receive the new trades
				const newTrades = await this.$store.dispatch("createMultipleOrders", { orders: this.orders });

				// Set message and update trades in the chart for immediate display
				this.message = "Orders successfully imported!";
				this.filteredTrades = newTrades; // Directly use new trades for the chart
			} catch (error) {
				this.message = "Failed to import orders.";
				console.error(error);
			}
		},
	},
};
</script>

<style scoped>
.orders-table {
	width: 100%;
	border-collapse: collapse;
	margin: 20px 0;
}

.orders-table th,
.orders-table td {
	padding: 12px 15px;
	text-align: left;
	border-bottom: 1px solid #ddd;
}

.orders-table th {
	background-color: #f4f4f4;
	font-weight: bold;
}

.orders-table tr:nth-child(even) {
	background-color: #f9f9f9;
}

.orders-table tr:hover {
	background-color: #f1f1f1;
}

.orders-table td {
	font-size: 0.95em;
}

.orders-table td:first-child {
	font-weight: bold;
}
.buy {
	background-color: #ffcccc; /* Light red for buy */
	color: red;
}

.sell {
	background-color: #ccffcc; /* Light green for sell */
	color: green;
}
</style>
