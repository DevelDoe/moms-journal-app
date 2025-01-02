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
        <input type="file" @click="startProcessing" @change="handleFileUpload" accept=".csv, .txt" />

        <button @click="importOrders" :disabled="!orders.length || !selectedAccountId || !application">Import Orders</button>

        <!-- Processing message -->
        <div v-if="isProcessing" class="loading-overlay">
            <p>Processing file... Please wait.</p>
        </div>

        <!-- Display the list of uploaded orders -->
        <table v-if="orders.length > 0 && !isProcessing" class="orders-table">
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
import { showToast } from "@/utils/toast";

export default {
    components: { FullScreenCulmReport },
    data() {
        return {
            orders: [],
            trades: [],
            isChartVisible: false,
            isProcessing: false,
            granularity: "hourly",
            selectedAccountId: "",
            availableApplications: [
                { value: "Sterling", label: "Sterling Trader Pro" },
                { value: "Standard", label: "Standard Format" },
                { value: "CMEG", label: "CMEG Export" },
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
        startProcessing() {
            // Add a small delay to ensure the file dialog opens first
            this.$nextTick(() => {
                setTimeout(() => {
                    this.isProcessing = true; // Set processing state after a short delay
                }, 500); // Delay by 50ms
            });
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) {
                console.error("No file selected.");
                this.isProcessing = false; // Reset processing state if no file selected
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const text = e.target.result;
                console.time("Parse Content");
                this.parseFileContent(text);
                console.timeEnd("Parse Content");
                this.isProcessing = false; // Reset processing after parsing
            };

            reader.onerror = () => {
                console.error("FileReader error.");
                this.isProcessing = false; // Reset processing state on error
            };

            reader.readAsText(file);
        },

        parseFileContent(content) {
            if (!this.application) {
                showToast.error("No application selected for parsing. Please select an application and try again.");
                this.isProcessing = false; // Reset processing state
                return;
            }

            const parserMethod = `${this.application.toLowerCase()}ParseFileContent`;
            if (typeof this[parserMethod] === "function") {
                try {
                    this[parserMethod](content);
                    showToast.success("File parsed successfully!");
                } catch (error) {
                    showToast.error("An error occurred while parsing the file. Please check the file format.");
                    console.error(`Error parsing file with method "${parserMethod}":`, error);
                } finally {
                    this.isProcessing = false; // Reset processing state
                }
            } else {
                showToast.error(`Parsing method for "${this.application}" is not implemented.`);
                this.isProcessing = false; // Reset processing state
            }
        },
        sterlingParseFileContent(content) {
            try {
                this.isProcessing = true; // Indicate processing has started

                const lines = content.split("\n").filter((line) => line.trim() !== "");

                this.orders = lines
                    .map((line) => {
                        const trimmedLine = line.trim();
                        const parts = trimmedLine.split(",").filter((part) => part !== "");

                        if (parts.length < 6) {
                            console.error("Invalid line format:", line);
                            return null;
                        }

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

                if (this.orders.length === 0) {
                    showToast.error("No valid orders found in the file. Please check the file content.");
                } else {
                    showToast.success(`${this.orders.length} orders parsed successfully!`);
                }
            } catch (error) {
                showToast.error("An error occurred while parsing the file. Please check the file format.");
                console.error("Error parsing Sterling file:", error);
            } finally {
                this.isProcessing = false; // Reset processing state
            }
        },

        // Placeholder for another application's parsing logic
        standardParseFileContent(content) {
            try {
                const lines = content.split("\n").filter((line) => line.trim() !== "");
                this.orders = lines
                    .map((line) => {
                        const parts = line
                            .trim()
                            .split(",")
                            .filter((part) => part !== "");
                        if (parts.length < 6) return null;

                        const [symbol, timeStr, side, quantity, price, dateStr] = parts;

                        const [month, day, year] = dateStr.split("/").map((part) => part.padStart(2, "0"));
                        const isoDateString = `${year}-${month}-${day}T${timeStr}`;
                        const date = new Date(isoDateString);

                        if (isNaN(date.getTime())) {
                            console.error("Date parsing failed for line:", line);
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
                    .filter((order) => order !== null);

                if (this.orders.length === 0) {
                    showToast.error("No valid orders found in the file. Please check the file content.");
                }
            } catch (error) {
                showToast.error("An error occurred while parsing the file. Please check the file format.");
                console.error("Error parsing standard file:", error);
            } finally {
                this.isProcessing = false; // Reset processing state
            }
        },
        cmegParseFileContent(content) {
            try {
                const lines = content.split("\n").filter((line) => line.trim() !== "");
                this.orders = lines
                    .slice(1) // Skip header row
                    .map((line) => {
                        const parts = line.split("|").map((part) => part.trim());
                        if (parts.length < 6) {
                            console.error("Invalid line:", line);
                            return null;
                        }

                        const [symbol, timeStr, side, quantity, price, dateStr] = parts;

                        const [monthName, day, year] = dateStr.split(" ").map((part) => part.trim().replace(",", ""));
                        const monthMap = {
                            Jan: "01",
                            Feb: "02",
                            Mar: "03",
                            Apr: "04",
                            May: "05",
                            Jun: "06",
                            Jul: "07",
                            Aug: "08",
                            Sep: "09",
                            Oct: "10",
                            Nov: "11",
                            Dec: "12",
                        };

                        const month = monthMap[monthName];
                        if (!month) {
                            console.error("Invalid month name:", monthName);
                            return null;
                        }

                        const formattedDate = `${year}-${month}-${day.padStart(2, "0")}T${timeStr}`;
                        const date = new Date(formattedDate);

                        if (isNaN(date.getTime())) {
                            console.error("Date parsing failed for line:", line);
                            return null;
                        }

                        return {
                            symbol: symbol.trim(),
                            time: timeStr.trim(),
                            side: side.trim().toLowerCase() === "b" ? "buy" : "sell",
                            quantity: parseInt(quantity.trim(), 10),
                            price: parseFloat(price.trim()),
                            date: date.toISOString(),
                        };
                    })
                    .filter((order) => order !== null);

                if (this.orders.length === 0) {
                    showToast.error("No valid orders found in the file. Please check the file content.");
                }
            } catch (error) {
                showToast.error("An error occurred while parsing the file. Please check the file format.");
                console.error("Error parsing CMEG file:", error);
            } finally {
                this.isProcessing = false; // Reset processing state
            }
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
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
</style>
