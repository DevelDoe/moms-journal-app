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
			this.socket = new WebSocket("ws://localhost:4000");

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
};
</script>
