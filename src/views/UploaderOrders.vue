<template>
	<div>
		<h2>Import Orders</h2>
		<input type="file" @change="handleFileUpload" accept=".txt" />
		<button @click="importOrders" :disabled="!orders.length">
			Import Orders
		</button>

		<ul>
			<li v-for="(order, index) in orders" :key="index">
				{{ order.date }} - {{ order.time }} - {{ order.symbol }} -
				{{ order.side }} - {{ order.quantity }} @ {{ order.price }} -
				{{ order.account }}
			</li>
		</ul>

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
				const filename = file.name; // Get the filename (e.g., "09102024.txt")
				const date = this.parseDateFromFilename(filename); // Extract date from filename
				this.parseFileContent(text, date); // Pass the parsed date and file content
			};
			reader.readAsText(file);
		},

		// Parse the file content and map to orders
		parseFileContent(content, date) {
			const lines = content
				.split("\n")
				.filter((line) => line.trim() !== ""); // Split lines and filter out empty ones

			this.orders = lines.map((line) => {
				const [time, symbol, side, quantity, price, account] =
					line.split(",");

				return {
					time: time.trim(),
					symbol: symbol.trim(),
					side: side.trim() === "BOT" ? "buy" : "sell", // Map 'BOT' to 'buy' and 'SLD' to 'sell'
					quantity: parseInt(quantity.trim(), 10),
					price: parseFloat(price.trim()),
					account: account.trim(),
					date: date, // Include the parsed date from the filename
				};
			});
		},

		// Function to extract and format date from the filename (expected format: ddmmyyyy)
		parseDateFromFilename(filename) {
			const datePattern = /^(\d{2})(\d{2})(\d{4})\.txt$/; // Regex pattern to match ddmmyyyy.txt
			const match = filename.match(datePattern);

			if (match) {
				const day = match[1]; // Extract the day
				const month = match[2]; // Extract the month
				const year = match[3]; // Extract the full year (e.g., 2024)

				// Create and return a new JavaScript Date object (Mongoose will store this as a Date)
				return new Date(`${year}-${month}-${day}`);
			}

			// Default return value if the pattern doesn't match
			return null;
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
