<template>
	<div class="account-display">
		<h2>Select Account</h2>
		<select v-model="selectedAccount" @change="fetchAccountDetails">
			<option disabled value="">Please select an account</option>
			<option v-for="account in userAccounts" :key="account.number" :value="account.number">{{ account.type }} ({{ account.number }})</option>
		</select>

		<div v-if="selectedAccountDetails" class="account-details">
			<h3>Account Details</h3>
			<p><strong>Account Type:</strong> {{ selectedAccountDetails.type }}</p>
			<p><strong>Account Number:</strong> {{ selectedAccountDetails.number }}</p>
			<p><strong>Balance:</strong> ${{ selectedAccountDetails.balance }}</p>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			selectedAccount: null,
			selectedAccountDetails: null,
		};
	},
	computed: {
		userAccounts() {
			return this.$store.getters.getUserAccounts; // Get the user's accounts from Vuex
		},
	},
	methods: {
		fetchAccountDetails() {
			this.selectedAccountDetails = this.userAccounts.find((account) => account.number === this.selectedAccount);
		},
	},
};
</script>

<style scoped>
.account-display {
	margin-top: 20px;
}

select {
	margin-bottom: 20px;
}

.account-details {
	border: 1px solid #ddd;
	padding: 10px;
	background-color: #f9f9f9;
}
</style>
