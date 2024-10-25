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

		<!-- Button to add a new broker -->
		<div v-if="!showBrokerForm">
			<button @click="toggleBrokerForm">Add New Broker</button>
		</div>

		<!-- Broker creation/update form -->
		<div v-if="showBrokerForm">
			<h3>{{ selectedBroker ? "Update" : "Add" }} Broker</h3>
			<form @submit.prevent="saveBroker" novalidate>
				<div>
					<label for="brokerName">Broker Name</label>
					<input v-model="newBroker.name" id="brokerName" required />
				</div>
				<div>
					<label for="brokerDescription">Broker Description</label>
					<input v-model="newBroker.description" id="brokerDescription" />
				</div>

				<!-- Account Section -->
				<h3>Manage Accounts</h3>
				<div v-for="(account, index) in newBroker.accountTypes" :key="index" style="margin-bottom: 15px">
					<div>
						<label for="accountType">Account Type</label>
						<input v-model="account.type" :id="'accountType' + index" required />
					</div>
					<div>
						<label for="ratePerShare">Rate Per Share ($)</label>
						<input v-model="account.rate_per_share" :id="'ratePerShare' + index" type="number" step="0.0001" />
					</div>

					<!-- ECN Route Management for this account -->
					<h4>ECN Routes</h4>
					<div v-for="(route, routeIndex) in account.ecn_routes" :key="routeIndex" style="margin-bottom: 10px">
						<div>
							<label for="routeName">Route Name</label>
							<input v-model="route.name" :id="'routeName' + routeIndex" />
						</div>
						<div>
							<label for="fees">Fees</label>
							<input v-model="route.fees" :id="'fees' + routeIndex" type="number" step="0.0001" />
						</div>
						<div>
							<label for="extendedFees">Extended Hours Fees</label>
							<input v-model="route.extended_fees" :id="'extendedFees' + routeIndex" type="number" step="0.0001" />
						</div>
						<button @click="removeRoute(index, routeIndex)" type="button" style="background-color: red; color: white">Remove Route</button>
					</div>
					<button @click="addRoute(index)" type="button">Add New Route</button>

					<!-- Remove Account -->
					<button @click="removeAccount(index)" type="button" style="background-color: red; color: white">Remove Account</button>
				</div>
				<button @click="addAccount" type="button">Add New Account</button>

				<!-- Platform Section -->
				<h3>Manage Platforms</h3>
				<div v-for="(platform, platformIndex) in newBroker.platforms" :key="platformIndex" style="margin-bottom: 15px">
					<div>
						<label for="platformName">Platform Name</label>
						<input v-model="platform.platform_name" :id="'platformName' + platformIndex" />
					</div>

					<!-- Market Data for the platform -->
					<h4>Market Data</h4>
					<div v-for="(marketData, mdIndex) in platform.market_data" :key="mdIndex" style="margin-bottom: 10px">
						<div>
							<label for="marketDataName">Market Data Name</label>
							<input v-model="marketData.name" :id="'marketDataName' + mdIndex" />
						</div>
						<div>
							<label for="nonProfessionalFee">Non-Professional Fee</label>
							<input v-model="marketData.non_professional_fee" :id="'nonProfessionalFee' + mdIndex" type="number" step="0.01" />
						</div>
						<div>
							<label for="professionalFee">Professional Fee</label>
							<input v-model="marketData.professional_fee" :id="'professionalFee' + mdIndex" type="number" step="0.01" />
						</div>
						<button @click="removeMarketData(platformIndex, mdIndex)" type="button" style="background-color: red; color: white">
							Remove Market Data
						</button>
					</div>
					<button @click="addMarketData(platformIndex)" type="button">Add New Market Data</button>
					<button @click="removePlatform(platformIndex)" type="button" style="background-color: red; color: white">Remove Platform</button>
				</div>
				<button @click="addPlatform" type="button">Add New Platform</button>

				<button type="submit">{{ selectedBroker ? "Update" : "Create" }} Broker</button>
				<button type="button" @click="cancelBrokerCreation">Cancel</button>

				<!-- Delete broker button: shown only when updating an existing broker -->
				<div v-if="selectedBroker && showBrokerForm">
					<button type="button" @click="deleteBroker" style="background-color: red; color: white">Delete Broker</button>
				</div>
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
			showBrokerForm: false, // Toggle for showing the broker creation form
			newBroker: {
				name: "",
				description: "",
				accountTypes: [], // Array of account types (each with ECN routes)
				platforms: [], // Array of platforms
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
		...mapActions([
			"createBrokerAction",
			"updateBrokerAction",
			"fetchBrokers",
			"deleteBrokerAction", // Action for deleting broker
		]),

		// Method to toggle the broker form
		toggleBrokerForm() {
			this.resetBrokerForm();
			this.showBrokerForm = true;
		},

		// Method to save the broker (either create or update)
		async saveBroker() {
			try {
				const payload = {
					brokerId: this.selectedBroker,
					broker: this.newBroker, // Send the entire broker object including accounts, routes, platforms
				};

				if (this.selectedBroker) {
					// Update broker
					await this.updateBrokerAction(payload);
				} else {
					// Create broker
					await this.createBrokerAction(this.newBroker);
				}

				this.showBrokerForm = false;
				this.resetBrokerForm();
			} catch (error) {
				console.error("Error saving broker:", error);
			}
		},

		// Add new account to the broker
		addAccount() {
			this.newBroker.accountTypes.push({
				type: "",
				rate_per_share: 0,
				min_amount: 0,
				max_amount: 0,
				percentage_rate: 0,
				ecn_routes: [], // Each account has its own array of ECN routes
			});
		},

		// Remove an account from the broker
		removeAccount(index) {
			this.newBroker.accountTypes.splice(index, 1);
		},

		// Add new ECN route to a specific account
		addRoute(accountIndex) {
			this.newBroker.accountTypes[accountIndex].ecn_routes.push({
				name: "",
				fees: 0,
				extended_fees: 0,
			});
		},

		// Remove an ECN route from a specific account
		removeRoute(accountIndex, routeIndex) {
			this.newBroker.accountTypes[accountIndex].ecn_routes.splice(routeIndex, 1);
		},

		// Add new platform to the broker
		addPlatform() {
			this.newBroker.platforms.push({
				platform_name: "",
				market_data: [],
			});
		},

		// Remove a platform from the broker
		removePlatform(index) {
			this.newBroker.platforms.splice(index, 1);
		},

		// Add new market data to a platform
		addMarketData(platformIndex) {
			this.newBroker.platforms[platformIndex].market_data.push({
				name: "",
				non_professional_fee: 0,
				professional_fee: 0,
			});
		},

		// Remove market data from a platform
		removeMarketData(platformIndex, mdIndex) {
			this.newBroker.platforms[platformIndex].market_data.splice(mdIndex, 1);
		},

		// Reset the broker form to default values
		resetBrokerForm() {
			this.newBroker = {
				name: "",
				description: "",
				accountTypes: [],
				platforms: [],
			};
		},

		// Method to handle broker selection change
		brokerChanged() {
			const broker = this.brokers.find((b) => b._id === this.selectedBroker);
			if (broker) {
				this.newBroker = { ...broker }; // Load the broker's data into the form for editing
				this.showBrokerForm = true; // Show broker form for editing
			}
		},

		// Method to delete the selected broker
		async deleteBroker() {
			if (this.selectedBroker) {
				try {
					// Dispatch the Vuex action to delete the broker
					await this.deleteBrokerAction(this.selectedBroker);

					// Reset the form and clear the selection
					this.resetBrokerForm();
					this.showBrokerForm = false;
					this.selectedBroker = ""; // Clear selection after deletion
				} catch (error) {
					console.error("Error deleting broker:", error);
				}
			}
		},

		// Method to cancel the broker creation or update
		cancelBrokerCreation() {
			this.showBrokerForm = false;
			this.resetBrokerForm();
		},
	},
	mounted() {
		this.fetchBrokers(); // Fetch brokers when the component is mounted
	},
};
</script>
