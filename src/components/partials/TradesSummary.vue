<!-- ./src/components/partials/charts/TradesSummary.vue -->
<template>
	<div class="trades-summary">
		<h2>Trades Summary</h2>
		<p>Total Trades: {{ totalTrades }}</p>
		<p>Accuracy: {{ accuracy.toFixed(2) }}%</p>
		<p>Profit to Loss Ratio: {{ profitToLossRatio }}</p>
		<p>Total Profit/Loss: ${{ totalProfitLoss.toFixed(2) }}</p>
	</div>
</template>

<script>
export default {
	props: {
		totalTrades: {
			type: Number,
			required: true,
		},
		accuracy: {
			type: Number,
			required: true,
		},
		profitToLossRatio: {
			type: String,
			required: true,
		},
		totalProfitLoss: {
			type: Number,
			required: true,
		},
	},
};
</script>

<style scoped>
.trades-summary {
	margin-top: 20px;
	font-size: 1.1em;
}
</style>
