<template>
	<div>
		<h2>Import Orders</h2>

		<!-- Account Selection Dropdown -->
		<label for="accountSelect">Select Account:</label>
		<select v-model="selectedAccountId" id="accountSelect" required>
			<option disabled value="">Select an account</option>
			<option v-for="account in userAccounts" :key="account._id" :value="account._id">
				{{ account.type === "live" ? "Live Account" : "Paper Account" }}
			</option>
		</select>

		<!-- File Input for Orders -->
		<input type="file" @change="handleFileUpload" accept=".txt" />
		<button @click="importOrders" :disabled="!orders.length || !selectedAccountId">Import Orders</button>

		<!-- Display the cumulative profit report for the uploaded trades -->
		<FullScreenCulmReport v-if="isChartVisible" :trades="trades" :granularity="granularity" @close="isChartVisible = false" />

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
import FullScreenCulmReport from "./partials/reports/FullScreenCulmReport.vue"; // Assuming this is the path

export default {
	components: { FullScreenCulmReport },
	data() {
		return {
			orders: [],
			trades: [],
			isChartVisible: false,
			granularity: "hourly",
			selectedAccountId: "", // Holds the selected account ID
		};
	},
	computed: {
		// Fetch user accounts from Vuex store
		userAccounts() {
			return this.$store.getters.getUser?.accounts || [];
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
		async importOrders() {
			try {
				// Include the accountId in each order object
				const ordersWithAccountId = this.orders.map((order) => ({
					...order,
					accountId: this.selectedAccountId, // Attach selected accountId to each order
				}));

				// Dispatch the action with the updated orders array
				const newTrades = await this.$store.dispatch("createMultipleOrders", {
					orders: ordersWithAccountId,
					accountId: this.selectedAccountId, // Pass accountId for verification if needed
				});

				// Rest of the logic remains the same
				if (newTrades) {
					this.message = "Orders successfully imported!";
					this.trades = newTrades;
					this.isChartVisible = true;
				} else {
					this.message = "Duplicate orders detected. No orders were saved.";
					this.isChartVisible = false;
				}
			} catch (error) {
				this.message = "Failed to import orders.";
				this.isChartVisible = false;
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
