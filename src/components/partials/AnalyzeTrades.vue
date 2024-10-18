<template>
    <div class="analyze-section">
        <button @click="analyzeTrades">Analyze Trades</button>
        <p>{{ gptResponse }}</p>
    </div>
</template>

<script>
export default {
    props: {
        todayTrades: {
            type: Array,
            required: true,
        },
        historicalTrades: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            socket: null, // WebSocket instance
            gptResponse: "", // Store the AI analysis from the WebSocket server
        };
    },
    methods: {
        // Helper function to get a random subset of trades
        getRandomTrades(trades, count) {
            const shuffled = trades.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        },

        // WebSocket integration to analyze trades
        analyzeTrades() {
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                this.socket = new WebSocket("wss://localhost:4000");

                this.socket.onopen = () => {
                    console.log("Connected to WebSocket server.");

                    const randomTodaySubset = this.getRandomTrades(this.todayTrades, 10);
                    const randomHistoricalSubset = this.getRandomTrades(this.historicalTrades, 10);

                    const dataToSend = {
                        todayTrades: randomTodaySubset,
                        historicalTrades: randomHistoricalSubset,
                    };

                    this.socket.send(JSON.stringify(dataToSend));
                };

                this.socket.onmessage = (event) => {
                    console.log("Received analysis from server:", event.data);
                    this.gptResponse = event.data;
                };

                this.socket.onerror = (error) => {
                    console.error("WebSocket Error:", error);
                };

                this.socket.onclose = () => {
                    console.log("WebSocket connection closed.");
                };
            } else {
                // If the socket is already open, send data immediately
                const randomTodaySubset = this.getRandomTrades(this.todayTrades, 10);
                const randomHistoricalSubset = this.getRandomTrades(this.historicalTrades, 10);

                const dataToSend = {
                    todayTrades: randomTodaySubset,
                    historicalTrades: randomHistoricalSubset,
                };
                this.socket.send(JSON.stringify(dataToSend));
            }
        },
    },
};
</script>

<style scoped>
.analyze-section {
    margin-top: 20px;
}
</style>
