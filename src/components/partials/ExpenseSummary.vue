<template>
	<div class="expense-summary">
		<h2>Expense Summary</h2>
		<p>Total Shares Bought: {{ totalSharesBought }}</p>
		<p>Total Expenses: ${{ totalExpenses.toFixed(2) }}</p>
		<p>Expenses Breakdown:</p>
		<ul>
			<li v-for="expense in expensesBreakdown" :key="expense.label">{{ expense.label }}: ${{ expense.amount.toFixed(2) }}</li>
		</ul>
	</div>
</template>

<script>
export default {
	props: {
		accountId: {
			type: String,
			required: true,
		},
		filterDate: {
			type: String,
			required: false,
		},
	},
	data() {
		return {
			totalSharesBought: 0,
			ecn_fees: 0,
			totalExpenses: 0,
			expensesBreakdown: [],
			orders: [],
			hasCorruptData: false,
		};
	},
	mounted() {
		this.fetchOrders(); // Fetch orders when the component is mounted
	},
	watch: {
		filterDate(newDate, oldDate) {
			console.log(`Filter date changed from ${oldDate} to ${newDate}`);
			this.calculateExpenses(); // Re-run calculations when the filterDate changes
		},
		accountId(newAccountId, oldAccountId) {
			console.log(`AccountId changed from ${oldAccountId} to ${newAccountId}`);
			this.fetchOrders(); // Re-fetch orders when accountId changes
		},
	},
	methods: {
		fetchOrders() {
			this.$store
				.dispatch("fetchOrdersByAccountId", this.accountId)
				.then((fetchedOrders) => {
					this.orders = fetchedOrders;
					this.calculateExpenses(); // Call this method to calculate total expenses
				})
				.catch((error) => {
					console.error("Error fetching orders:", error);
				});
		},

		filteredOrders() {
			this.hasCorruptData = false;

			const validOrders = this.orders.filter((order) => {
				const isValid = order && order.symbol && order.accountId && order.quantity !== undefined && order.price !== undefined && order.date;
				if (!isValid) this.hasCorruptData = true;
				return isValid && order.accountId === this.accountId;
			});

			if (!this.filterDate) return validOrders;

			const formattedFilterDate = new Date(this.filterDate).toISOString().split("T")[0];
			return validOrders.filter((order) => {
				const formattedOrderDate = new Date(order.date).toISOString().split("T")[0];
				return formattedFilterDate === formattedOrderDate;
			});
		},

		calculateTotalShares() {
			const filteredOrders = this.filteredOrders();
			let totalShares = filteredOrders.reduce((sum, order) => {
				const quantityBought = parseFloat(order.quantity) || 0;
				return sum + quantityBought;
			}, 0);
			return totalShares;
		},

		calEcnFees() {
			const userAccounts = this.$store.getters.getUserAccounts;
			const account = userAccounts.find((acc) => acc.accountId === this.accountId);

			if (!account || !account.specifications) {
				console.error(`No account or specifications found for accountId: ${this.accountId}`);
				return 0;
			}

			const { ecn_fees } = account.specifications;
			const filteredOrders = this.filteredOrders();

			const ecnFees = filteredOrders.reduce((total, order) => {
				const quantity = parseFloat(order.quantity) || 0;
				return total + quantity * ecn_fees;
			}, 0);

			this.expensesBreakdown.push({ label: "ECN Fees", amount: ecnFees });
			return ecnFees;
		},

		calCommissions() {
			const userAccounts = this.$store.getters.getUserAccounts;
			const account = userAccounts.find((acc) => acc.accountId === this.accountId);

			if (!account || !account.specifications) {
				console.error(`No account or specifications found for accountId: ${this.accountId}`);
				return 0;
			}

			const { rate_per_share, min_amount, max_amount } = account.specifications;
			const filteredOrders = this.filteredOrders();

			let totalCommissions = filteredOrders.reduce((total, order) => {
				const quantity = parseFloat(order.quantity) || 0;
				const price = parseFloat(order.price) || 0;
				const orderValue = price * quantity;

				let commission = quantity * rate_per_share;
				commission = Math.max(commission, min_amount);

				if (orderValue > 0) {
					const maxCommission = (max_amount / 100) * orderValue;
					commission = Math.min(commission, maxCommission);
				}

				return total + commission;
			}, 0);

			this.expensesBreakdown.push({ label: "Commissions", amount: totalCommissions });
			return totalCommissions;
		},

		calculateExpenses() {
			// Reset the expenses breakdown before recalculating
			this.expensesBreakdown = [];

			// Recalculate total shares, ECN fees, and commissions
			this.totalSharesBought = this.calculateTotalShares();
			this.ecn_fees = this.calEcnFees();
			this.calCommissions();

			// Calculate total expenses based on the breakdown
			this.totalExpenses = this.expensesBreakdown.reduce((sum, expense) => sum + expense.amount, 0);

			console.log("Total Expenses Calculated:", this.totalExpenses);
		},
	},
};
</script>

<style scoped>
.expense-summary {
	margin-top: 20px;
}
</style>
