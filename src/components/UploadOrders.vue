<template>
	<div>
		<h2>Import Orders</h2>
		<input type="file" @change="handleFileUpload" accept=".txt" />
		<button @click="importOrders" :disabled="!orders.length">
			Import Orders
		</button>

		<!-- <ul>
		<li v-for="(order, index) in orders" :key="index">
		  {{ order.date }} - {{ order.time }} - {{ order.symbol }} - {{ order.side }} - {{ order.quantity }} @ {{ order.price }} - {{ order.account }}
		</li>
	  </ul> -->

		<table v-if="orders.length > 0" class="orders-table">
			<thead>
				<tr>
					<th>Symbol</th>
					<th>Time</th>
					<th>Side</th>
					<th>Quantity</th>
					<th>Price</th>
					<th>Date</th>
					<th>Account</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="order in orders"
					:key="order._id"
					:class="{
						buy: order.side === 'buy',
						sell: order.side === 'sell',
					}"
				>
					<td>{{ order.symbol }}</td>
					<td>{{ new Date(order.date).toLocaleTimeString() }}</td>
					<td>{{ order.side }}</td>
					<td>{{ order.quantity }}</td>
					<td>${{ order.price.toFixed(4) }}</td>
					<td>{{ new Date(order.date).toLocaleDateString() }}</td>
					<td>{{ order.account }}</td>
				</tr>
			</tbody>
		</table>

		<p v-if="message">{{ message }}</p>
	</div>
</template>

<script>
export default {
	data() {
		return {
			orders: [], // Store parsed orders
			message: "", // Store success or error messages
		};
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
			const lines = content
				.split("\n")
				.filter((line) => line.trim() !== ""); // Split lines and filter out empty ones

			// console.log("Lines after splitting and filtering:", lines); // Log all lines

			this.orders = lines
				.map((line, index) => {
					// console.log(`Processing line ${index + 1}:`, line); // Log each line being processed

					const trimmedLine = line.trim(); // Trim the line to remove \r or other extra characters
					let parts = trimmedLine
						.split(",")
						.filter((part) => part !== ""); // Filter out any empty parts
					// console.log("Split parts:", parts); // Log the parts after splitting

					// Extract necessary values from the split line
					const dateStr = parts[0]; // Date string
					const timeStr = parts[1]; // Time string
					const symbol = parts[2]; // Symbol
					const side = parts[3]; // Side (BOT or SLD)
					const quantity = parts[4]; // Quantity
					const account = parts[parts.length - 1]; // Account is always the last field

					let price;

					// Check for price format (whole number, number with decimals, or missing decimal part)
					if (parts.length === 7) {
						// Whole number price without a decimal part
						price = parseFloat(parts[5]);
					} else if (parts.length === 8) {
						// Handle price with or without decimal part
						const priceWhole = parts[5].trim();
						const priceDecimal = parts[6].trim();

						// If priceDecimal is empty or invalid, default to 0
						price = parseFloat(
							`${priceWhole}.${priceDecimal || "00"}`
						);
					}

					// console.log("Parsed price:", price); // Log the parsed price

					if (isNaN(price)) {
						console.error("Price parsing failed for line:", line);
						price = 0; // Set a fallback value if parsing failed
					}

					// Convert the date from 'dd/mm/yy' to an ISO Date string
					const dateParts = dateStr.split("/"); // ['08', '10', '24']
					const day = parseInt(dateParts[0], 10)
						.toString()
						.padStart(2, "0"); // Ensure two digits
					const month = parseInt(dateParts[1], 10)
						.toString()
						.padStart(2, "0"); // Ensure two digits
					const year = `20${dateParts[2]}`; // Assuming it's 20xx for 'yy' format

					// console.log(
					// 	`Parsed date parts - Year: ${year}, Month: ${month}, Day: ${day}, Time: ${timeStr}`
					// ); // Log date parts

					// Construct the ISO date string in the form YYYY-MM-DDTHH:MM:SS
					const isoDateString = `${year}-${month}-${day}T${timeStr}`;
					// console.log("Constructed ISO date string:", isoDateString); // Log the ISO date string

					// Create the Date object from the ISO string
					const date = new Date(isoDateString);
					// console.log("Parsed Date object:", date); // Log the created Date object

					// Ensure the date is valid
					if (isNaN(date.getTime())) {
						console.error("Date parsing failed for line:", line);
						this.message =
							"Date parsing failed, please check the file format.";
						return null; // Return null to filter out invalid entries
					}

					return {
						date, // Full JavaScript Date object (date + time)
						symbol: symbol.trim(),
						side: side.trim() === "BOT" ? "buy" : "sell", // Map 'BOT' to 'buy' and 'SLD' to 'sell'
						quantity: parseInt(quantity.trim(), 10),
						price: price, // Ensure price is correctly parsed
						account: account.trim(),
					};
				})
				.filter((order) => order !== null); // Filter out any null entries due to parsing errors

			// console.log("Final parsed orders:", this.orders); // Log the final parsed orders
		},

		// Send parsed orders to the backend
		async importOrders() {
			try {
				for (const order of this.orders) {
					// Send each order to the backend
					await this.$store.dispatch("createOrder", order); // Assuming you have createOrder action in Vuex
				}
				this.message = "Orders successfully imported!";
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
