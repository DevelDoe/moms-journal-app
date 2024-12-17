<template>
    <div>
        <h2>Import Orders</h2>

        <!-- Application Selection Dropdown -->
        <label for="appSelect">Select Application:</label>
        <select v-model="application" id="appSelect" required>
            <option disabled value="">Select an application</option>
            <option v-for="app in availableApplications" :key="app.value" :value="app.value">
                {{ app.label }}
            </option>
        </select>

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
        <button @click="importOrders" :disabled="!orders.length || !selectedAccountId || !application">Import Orders</button>
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
            selectedAccountId: "",
            availableApplications: [
                { value: "Sterling", label: "Sterling Trader Pro" },
                { value: "Standard", label: "Standard Format" },
            ],
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
                this.parseFileContent(text); // Delegate parsing
            };
            reader.readAsText(file);
        },
        parseFileContent(content) {
            if (!this.application) {
                console.error("No application selected for parsing.");
                return;
            }

            const parserMethod = `${this.application.toLowerCase()}ParseFileContent`;
            if (typeof this[parserMethod] === "function") {
                this[parserMethod](content); // Call the appropriate parsing method
            } else {
                console.error(`Parsing method "${parserMethod}" is not implemented.`);
            }
        },
        sterlingParseFileContent(content) {
            // Sterling-specific parsing logic
            const lines = content.split("\n").filter((line) => line.trim() !== "");

            this.orders = lines
                .map((line) => {
                    const trimmedLine = line.trim();
                    let parts = trimmedLine.split(",").filter((part) => part !== "");

                    const dateStr = parts[0];
                    const timeStr = parts[1];
                    const symbol = parts[2];
                    const side = parts[3];
                    const quantity = parts[4];
                    const price = parts.length === 7 ? parseFloat(parts[5]) : parseFloat(`${parts[5]}.${parts[6] || "00"}`);

                    const dateParts = dateStr.split("/");
                    const day = parseInt(dateParts[0], 10).toString().padStart(2, "0");
                    const month = parseInt(dateParts[1], 10).toString().padStart(2, "0");
                    const year = `20${dateParts[2]}`;

                    const isoDateString = `${year}-${month}-${day}T${timeStr}`;
                    const date = new Date(isoDateString);

                    if (isNaN(date.getTime())) {
                        console.error("Date parsing failed for line:", line);
                        this.message = "Date parsing failed, please check the file format.";
                        return null;
                    }

                    return {
                        date,
                        symbol: symbol.trim(),
                        side: side.trim() === "BOT" ? "buy" : "sell",
                        quantity: parseInt(quantity.trim(), 10),
                        price: price,
                    };
                })
                .filter((order) => order !== null);
        },
        // Placeholder for another application's parsing logic
        standardParseFileContent(content) {
            const lines = content.split("\n").filter((line) => line.trim() !== "");

            this.orders = lines
                .map((line) => {
                    const trimmedLine = line.trim();
                    const parts = trimmedLine.split(",").filter((part) => part !== "");

                    if (parts.length < 6) return null; // Ensure all fields exist

                    const [symbol, timeStr, side, quantity, price, dateStr] = parts;

                    // Parse date into ISO format (YYYY-MM-DDTHH:mm:ss)
                    const [month, day, year] = dateStr.split("/").map((part) => part.padStart(2, "0"));
                    const isoDateString = `${year}-${month}-${day}T${timeStr}`;
                    const date = new Date(isoDateString);

                    if (isNaN(date.getTime())) {
                        console.error("Date parsing failed for line:", line);
                        this.message = "Date parsing failed, please check the file format.";
                        return null;
                    }

                    return {
                        symbol: symbol.trim(),
                        time: timeStr.trim(),
                        side: side.trim().toLowerCase() === "buy" ? "buy" : "sell",
                        quantity: parseInt(quantity.trim(), 10),
                        price: parseFloat(price.trim()),
                        date: date,
                    };
                })
                .filter((order) => order !== null); // Filter out invalid entries
        },
        async importOrders() {
            try {
                const ordersWithAccountId = this.orders.map((order) => ({
                    ...order,
                    accountId: this.selectedAccountId,
                }));

                const newTrades = await this.$store.dispatch("createMultipleOrders", {
                    orders: ordersWithAccountId,
                    accountId: this.selectedAccountId,
                });

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
    background-color: #0b192c; /* Match app's dark background */
    color: #eaeaea; /* Light text for contrast */
}

.orders-table th,
.orders-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #1e3e62; /* Subtle dark border */
}

.orders-table th {
    background-color: #1e3e62; /* Dark header background */
    font-weight: bold;
    color: #eaeaea; /* Light text for the header */
}

.orders-table tr:nth-child(even) {
    background-color: #162437; /* Slightly lighter dark row background */
}

.orders-table tr:hover {
    background-color: #223c5f; /* Highlight hover row with a soft contrast */
}

.orders-table td {
    font-size: 0.95em;
}

.orders-table td:first-child {
    font-weight: bold;
    color: #ffde59; /* Add slight emphasis for the first column */
}

.buy {
    background-color: #2e4c6d; /* Darker blue for "buy" */
    color: #72bf78; /* Light green for "buy" text */
}

.sell {
    background-color: #4d2631; /* Darker red for "sell" */
    color: #f77474; /* Light red for "sell" text */
}
</style>
