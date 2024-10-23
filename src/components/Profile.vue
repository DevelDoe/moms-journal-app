<template>
	<div id="Profile" class="container">
		<!-- Loading animation while data is being fetched -->
		<div v-if="isLoading" class="loading-animation">
			<p>Loading...</p>
		</div>

		<!-- Show the profile content only when data is fully loaded -->
		<div v-else>
			<h1>{{ user.name }}</h1>

			<!-- Account Selection -->
			<div>
				<label for="account">Select Account:</label>
				<select v-model="selectedAccountId">
					<option disabled value="">Please select an account</option>
					<option v-for="account in userAccounts" :key="account.accountId" :value="account.accountId">
						{{ account.specifications.type }} ({{ account.number }})
					</option>
				</select>
			</div>

			<!-- Date Picker for Filtering -->
			<div class="date-filter">
				<label for="filter-date">Filter by Date:</label>
				<input type="date" id="filter-date" v-model="filterDate" />
			</div>

			<!-- Check if accountId and filterDate are defined before rendering -->
			<div v-if="selectedAccountId && filterDate" class="trades">
				<!-- Display TradesSummary and ExpenseSummary components -->
				<TradesSummary :filterDate="filterDate" :accountId="selectedAccountId" />
				<ExpenseSummary :filterDate="filterDate" :accountId="selectedAccountId" />
			</div>
		</div>
	</div>
</template>

<script>
import TradesSummary from "./partials/TradesSummary.vue";
import ExpenseSummary from "./partials/ExpenseSummary.vue";

export default {
	data() {
		return {
			user: null,
			selectedAccountId: null,
			filterDate: "",
			isLoading: true,
		};
	},
	components: {
		TradesSummary,
		ExpenseSummary,
	},
	computed: {
		userAccounts() {
			return this.$store.getters.getUserAccounts;
		},
	},
	mounted() {
		this.fetchUserAndAccountData();
	},
	methods: {
		async fetchUserAndAccountData() {
			this.isLoading = true;
			try {
				await this.$store.dispatch("fetchUser");
				this.user = this.$store.getters.getUser;

				if (this.userAccounts.length > 0) {
					this.selectedAccountId = this.userAccounts[0].accountId;
				}
				this.isLoading = false;
			} catch (error) {
				this.isLoading = false;
				console.error("Error fetching user or account data:", error);
			}
		},
	},
};
</script>

<style scoped>
/* Add your styles here */
</style>
