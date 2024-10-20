<template>
	<div>
		<h2>Broker Manager</h2>

		<!-- Dropdown to select an existing broker -->
		<div>
			<label for="brokerSelect">Select Broker</label>
			<select v-model="selectedBroker" id="brokerSelect" @change="brokerChanged">
				<option disabled value="">Please select one</option>
				<option v-for="broker in brokers" :key="broker._id" :value="broker._id">{{ broker.name }}</option>
			</select>
		</div>

		<!-- Button to add a new broker (only visible when no broker is selected) -->
		<div v-if="!showBrokerForm">
			<button @click="toggleBrokerForm">Add New Broker</button>
		</div>

		<!-- Broker creation/update form -->
		<div v-if="showBrokerForm">
			<h3>{{ selectedBroker ? "Update" : "Add" }} Broker</h3>
			<form @submit.prevent="selectedBroker ? updateBroker() : createBroker()" novalidate>
				<div>
					<label for="brokerName">Broker Name</label>
					<input v-model="newBroker.name" id="brokerName" required />
				</div>
				<div>
					<label for="brokerDescription">Broker Description</label>
					<input v-model="newBroker.description" id="brokerDescription" />
				</div>

				<button type="submit">{{ selectedBroker ? "Update" : "Create" }} Broker</button>
				<button type="button" @click="cancelBrokerCreation">Cancel</button>
			</form>
		</div>

		<!-- Dropdown to select an existing account for the selected broker -->
		<div v-if="selectedBroker && brokerAccounts.length > 0">
			<h3>Select Account Type</h3>
			<select v-model="selectedAccount" id="accountSelect" @change="accountChanged">
				<option disabled value="">Please select an account</option>
				<option v-for="account in brokerAccounts" :key="account.type" :value="account">{{ account.type }}</option>
			</select>
		</div>

		<!-- Button to add a new account (only visible when a broker is selected) -->
		<div v-if="selectedBroker && !selectedAccount">
			<button @click="toggleAccountForm">Add New Account</button>
		</div>

		<!-- Add/Update Account section (form only visible when the 'Add New Account' button is clicked or an account is selected) -->
		<div v-if="showAccountForm || selectedAccount">
			<h3>{{ selectedAccount ? "Update" : "Add" }} Account for Broker</h3>
			<form @submit.prevent="addAccount" novalidate>
				<div>
					<label for="accountType">Account Type</label>
					<input v-model="newAccount.type" id="accountType" required />
				</div>
				<div>
					<label for="ratePerShare">Rate Per Share</label>
					<input v-model="newAccount.rate_per_share" id="ratePerShare" type="number" step="0.0001" required />
				</div>
				<div>
					<label for="minAmount">Minimum Commission</label>
					<input v-model="newAccount.min_amount" id="minAmount" type="number" required />
				</div>
				<div>
					<label for="maxAmount">Maximum Commission</label>
					<input v-model="newAccount.max_amount" id="maxAmount" type="number" required />
				</div>
				<div>
					<label for="percentageRate">Percentage Commission</label>
					<input v-model="newAccount.percentage_rate" id="percentageRate" type="number" step="0.01" required />
				</div>
				<div>
					<label for="ecnFees">ECN Fees</label>
					<input v-model="newAccount.ecn_fees" id="ecnFees" type="number" step="0.0001" required />
				</div>
				<div>
					<label for="inactivityFee">Inactivity Fee</label>
					<input v-model="newAccount.inactivity_fee" id="inactivityFee" type="number" required />
				</div>
				<div>
					<label for="marketDataFee">Market Data Fee</label>
					<input v-model="newAccount.market_data_fee" id="marketDataFee" type="number" required />
				</div>
				<div>
					<label for="platformFee">Platform Fee</label>
					<input v-model="newAccount.platform_fee" id="platformFee" type="number" required />
				</div>
				<div>
					<label for="withdrawalFee">Withdrawal Fee</label>
					<input v-model="newAccount.withdrawal_fee" id="withdrawalFee" type="number" required />
				</div>
				<div>
					<label for="extendedHoursTradingFee">Extended Hours Trading Fee</label>
					<input v-model="newAccount.extended_hours_trading_fee" id="extendedHoursTradingFee" type="number" step="0.0001" required />
				</div>
				<div>
					<label for="minimumDeposit">Minimum Deposit</label>
					<input v-model="newAccount.minimumDeposit" id="minimumDeposit" type="number" required />
				</div>
				<button type="submit">{{ selectedAccount ? "Update" : "Add" }} Account</button>
			</form>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
	data() {
		return {
			selectedBroker: "", // To hold the selected broker ID
			selectedAccount: null, // Holds the selected account object
			showBrokerForm: false, // Toggle for showing the broker creation form
			showAccountForm: false, // Toggle for showing the account creation form
			newBroker: {
				name: "",
				description: "",
			},
			newAccount: {
				type: "",
				rate_per_share: 0,
				min_amount: 0,
				max_amount: 0,
				percentage_rate: 0,
				// Add more fields as needed
			},
		};
	},
	computed: {
		...mapGetters(["getBrokers"]), // Get the list of brokers from Vuex
		brokers() {
			return this.getBrokers;
		},
		brokerAccounts() {
			const broker = this.brokers.find((b) => b._id === this.selectedBroker);
			return broker ? broker.accountTypes : [];
		},
	},
	methods: {
		...mapActions(["createBrokerAction", "updateBrokerAction", "addAccountAction", "updateAccountAction", ""]),
		async createBroker() {
			try {
				await this.createBrokerAction(this.newBroker);
				this.showBrokerForm = false;
				this.resetBrokerForm();
			} catch (error) {
				if (process.env.NODE_ENV === "development") {
					console.error("Error adding broker:", error);
				}
			}
		},
		async updateBroker() {
			try {
				const payload = { brokerId: this.selectedBroker, broker: this.newBroker };
				await this.updateBrokerAction(payload);
				this.showBrokerForm = false;
				this.resetBrokerForm();
			} catch (error) {
				if (process.env.NODE_ENV === "development") {
					console.error("Error updating broker:", error);
				}
			}
		},

		async addAccount() {
			try {
				const payload = { brokerId: this.selectedBroker, account: this.newAccount };
				await this.addAccountAction(payload);
				this.showAccountForm = false;
				this.resetAccountForm();
			} catch (error) {
				if (process.env.NODE_ENV === "development") {
					console.error("Error adding account:", error);
				}
			}
		},
		async updateAccount() {
			try {
				const payload = { brokerId: this.selectedBroker, account: this.newAccount };
				await this.updateAccountAction(payload);
				this.selectedAccount = null;
				this.showAccountForm = false;
				this.resetAccountForm();
			} catch (error) {
				if (process.env.NODE_ENV === "development") {
					console.error("Error updating account:", error);
				}
			}
		},
		toggleBrokerForm() {
			this.showBrokerForm = !this.showBrokerForm;
			this.resetBrokerForm();
			this.showBrokerForm = true;
		},
		toggleAccountForm() {
			this.selectedAccount = null;
			this.resetAccountForm();
			this.showAccountForm = true;
		},
		cancelBrokerCreation() {
			this.showBrokerForm = false;
			this.resetBrokerForm();
			this.selectedBroker = "";
		},
		cancelAccountCreation() {
			this.showAccountForm = false;
			this.selectedAccount = null;
			this.resetAccountForm();
		},
		resetBrokerForm() {
			this.newBroker = { name: "", description: "" };
		},
		resetAccountForm() {
			this.newAccount = { type: "", rate_per_share: 0, min_amount: 0, max_amount: 0, percentage_rate: 0 };
		},
		brokerChanged() {
			const broker = this.brokers.find((b) => b._id === this.selectedBroker);
			if (broker) {
				this.newBroker = { name: broker.name, description: broker.description };
				this.showBrokerForm = true; // Show broker form for editing
			}
			this.showAccountForm = false;
			this.selectedAccount = null;
		},
		accountChanged() {
			if (this.selectedAccount) {
				this.newAccount = { ...this.selectedAccount };
				this.showAccountForm = true; // Show account form for editing
			}
		},
	},
	mounted() {
		this.$store.dispatch("fetchBrokers");
	},
};
</script>

<style scoped>
form {
	margin-bottom: 20px;
}

label {
	display: block;
	margin-bottom: 5px;
}

input {
	margin-bottom: 10px;
	padding: 5px;
}
</style>
