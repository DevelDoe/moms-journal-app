<template>
	<div class="expenses-summary">
	  <!-- Loading message for expenses -->
	  <div v-if="isLoadingExpenses" class="loading-message">
		<p>Loading expenses...</p>
	  </div>
  
	  <!-- No expenses available -->
	  <div v-else-if="filteredOrders().length === 0" class="no-expenses">
		<p>No expenses available for the selected account.</p>
	  </div>
  
	  <!-- Display expense summary when data is available -->
	  <div v-else>
		<div class="table">
		  <div class="row header bold">
			<div class="cell nonderline">Expense Summary</div>
			<div class="cell nonderline"></div>
		  </div>
  
		  <div class="row">
			<div class="cell nonderline">Total Shares Bought</div>
			<div class="cell">{{ totalSharesBought }}</div>
		  </div>
  
		  <div class="row" v-for="expense in expensesBreakdown" :key="expense.label">
			<div class="cell nonderline">{{ expense.label }}</div>
			<div class="cell">${{ expense.amount.toFixed(2) }}</div>
		  </div>
  
		  <div class="row nonderline">
			<div class="cell nonderline">Total Expenses:</div>
			<div class="cell nonderline">${{ totalExpenses.toFixed(2) }}</div>
		  </div>
		</div>
	  </div>
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
		isLoadingExpenses: false, // Loading state for expenses
	  };
	},
	mounted() {
	  this.fetchOrders(); // Fetch orders when the component is mounted
	},
	watch: {
	  accountId(newAccountId, oldAccountId) {
		if (newAccountId !== oldAccountId) {
		  this.fetchOrders(); // Re-fetch orders when accountId changes
		}
	  },
	  filterDate(newDate, oldDate) {
		if (newDate !== oldDate) {
		  this.calculateExpenses(); // Re-run calculations when the filterDate changes
		}
	  },
	},
	methods: {
	  async fetchOrders() {
		this.isLoadingExpenses = true; // Start loading
		try {
		  const fetchedOrders = await this.$store.dispatch("fetchOrdersByAccountId", this.accountId);
		  this.orders = Array.isArray(fetchedOrders) ? fetchedOrders : []; // Ensure orders are always an array
		  this.calculateExpenses(); // Calculate expenses after fetching orders
		} catch (error) {
		  console.error("Error fetching orders:", error);
		  this.orders = []; // Reset orders to empty array on error
		} finally {
		  this.isLoadingExpenses = false; // Stop loading
		}
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
  .table {
	display: table;
	width: 80%;
	margin: 0 auto;
	border-collapse: collapse;
	margin-top: 50px;
  }
  
  .row {
	display: table-row;
	text-align: center;
  }
  
  .cell {
	display: table-cell;
	padding: 10px 20px;
	border-bottom: 1px solid #ccc;
	font-size: 14px;
  }
  
  .bold {
	font-weight: bold;
  }
  .underline {
	border-bottom: 2px solid #333;
  }
  .header .cell {
	font-weight: bold;
	border-bottom: 2px solid #333;
	font-size: 1.3rem;
  }
  
  .nonderline {
	border-bottom: none !important;
  }
  
  .bold .cell {
	border-bottom: 2px solid #000;
	font-size: 16px;
  }
  
  .cell[colspan="3"] {
	text-align: right;
	padding-right: 50px;
	font-weight: bold;
  }
  </style>
  