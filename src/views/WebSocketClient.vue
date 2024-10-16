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
			const socket = new WebSocket('wss://localhost:4000');

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
h1 {
  font-size: 24px;
  margin-bottom: 10px;
}
input {
  padding: 8px;
  margin-right: 10px;
}
button {
  padding: 8px;
}
</style>