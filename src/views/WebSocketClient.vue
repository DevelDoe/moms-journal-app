<template>
	<div>
		<h1>WebSocket Client</h1>
		<p>Status: {{ connectionStatus }}</p>
		<input v-model="message" placeholder="Type a message" />
		<button @click="sendMessage">Send Message</button>
		<p>Server Response: {{ serverResponse }}</p>
	</div>
</template>

<script>
export default {
	data() {
		return {
			socket: null,
			message: "",
			serverResponse: "",
			connectionStatus: "Disconnected",
		};
	},
	methods: {
		connectWebSocket() {
			// Sreate a WebSocket connection
			this.socket = new WebSocket('wss://localhost:4000');

			// Handle WebSocket events
			this.socket.onopen = () => {
				this.connectionStatus = "Connected";
			};

			this.socket.onmessage = (event) => {
				this.serverResponse = event.data;
			};

			this.socket.onclose = () => {
				this.connectionStatus = "Disconnected";
			};

			this.socket.onerror = (error) => {
				console.error("WebSocket Error:", error);
				this.connectionStatus = "Error";
			};
		},

		sendMessage() {
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.send(this.message);
			} else {
				console.error("WebSocket is not connected");
			}
		},
	},
	mounted() {
		// Connect to the WebSocket server when the component is mounted
		this.connectWebSocket();
	},
	beforeDestroy() {
		// Close the WebSocket connection when the component is destroyed
		if (this.socket) {
			this.socket.close();
		}
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