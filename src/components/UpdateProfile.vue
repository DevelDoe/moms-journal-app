<template>
	<div>
		<h2>Select Broker and Account</h2>

		<!-- Dropdown for selecting a broker -->
		<label for="broker">Select Broker:</label>
		<select v-model="selectedBrokerId" @change="onBrokerChange">
			<option v-for="broker in brokers" :key="broker._id" :value="broker._id">{{ broker.name }}</option>
		</select>

		<!-- Dropdown for selecting account type (visible after broker is selected) -->
		<div v-if="selectedBrokerId">
			<label for="account">Select Account Type:</label>
			<select v-model="selectedAccountId">
				<option v-for="accountType in selectedBrokerAccountTypes" :key="accountType._id" :value="accountType._id">
					{{ accountType.type }}
				</option>
			</select>
		</div>

		<!-- Input for Account Number -->
		<div v-if="selectedAccountId">
			<label for="accountNumber">Enter Account Number:</label>
			<input v-model="accountNumber" type="text" id="accountNumber" placeholder="Account Number" required />
		</div>

		<!-- Input for Account Balance (optional) -->
		<div v-if="selectedAccountId">
			<label for="balance">Enter Initial Balance (Optional):</label>
			<input v-model="balance" type="number" id="balance" placeholder="Initial Balance" />
		</div>

		<!-- Button to add the selected broker and account to the user's profile -->
		<button @click="addAccount" :disabled="!selectedBrokerId || !selectedAccountId || !accountNumber">Add Account</button>
	</div>
	<div>
		<h2>Your Accounts</h2>

		<ul>
			<li v-for="account in userAccounts" :key="account._id">
				{{ account.type }} ({{ account.number }}) - Balance: ${{ account.balance }}
				<button @click="removeAccount(account._id)">Delete</button>
			</li>
		</ul>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
	data() {
		return {
			selectedBrokerId: null, // The ID of the selected broker
			selectedAccountId: null, // The account ID selected by the user (instead of account type)
			accountNumber: "", // New account number input
			balance: null, // New account balance input (optional)
		};
	},
	computed: {
		// Get the list of brokers from Vuex state
		...mapGetters(["getBrokers", "getUserAccounts"]),

		brokers() {
			return this.getBrokers;
		},

		userAccounts() {
			return this.getUserAccounts;
		},

		// Get the currently selected broker's account types
		selectedBrokerAccountTypes() {
			const broker = this.brokers.find((b) => b._id === this.selectedBrokerId);
			return broker ? broker.accountTypes : []; // Ensure accountTypes is an array
		},
	},
	methods: {
		...mapActions(["fetchBrokers", "addUserAccount", "removeUserAccount"]), // Fetch brokers and add account actions from Vuex

		onBrokerChange() {
			// Reset the account type and inputs when a new broker is selected
			this.selectedAccountId = null;
			this.accountNumber = "";
			this.balance = null;
		},

		async addAccount() {
			if (!this.selectedBrokerId || !this.selectedAccountId || !this.accountNumber) {
				this.$toast.error("Please fill all required fields.");
				return;
			}

			// Find the selected account type based on the selectedAccountId
			const selectedAccountType = this.selectedBrokerAccountTypes.find((account) => account._id === this.selectedAccountId);

			if (!selectedAccountType) {
				this.$toast.error("Selected account type is invalid.");
				return;
			}

			// Data for the new account to be added
			const newAccount = {
				brokerId: this.selectedBrokerId, // Broker ID
				accountId: this.selectedAccountId, // Account ID
				type: selectedAccountType.type, // Account type name
				number: this.accountNumber, // User-provided account number
				balance: this.balance || 0, // Optional balance
			};

			try {
				// Dispatch Vuex action to add the new account to the user profile
				await this.addUserAccount(newAccount);

				// Reset form fields after adding the account
				this.selectedBrokerId = null;
				this.selectedAccountId = null;
				this.accountNumber = "";
				this.balance = null;
			} catch (error) {
				const errorMessage = error.response?.data?.message || "An error occurred while adding the account.";
				this.$toast.error(errorMessage);
			}
		},
		async removeAccount(accountId) {
			try {
				await this.removeUserAccount(accountId); // Trigger the remove action with the account ID
				this.$toast.success("Account removed successfully!");
			} catch (error) {
				console.log("Error removing account.");
			}
		},
	},
	// Fetch brokers when the component is mounted
	async mounted() {
		await this.fetchBrokers(); // Fetch all brokers
	},
};
</script>
