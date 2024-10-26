<template>
	<div id="Profile" class="container">
		<!-- Loading animation while data is being fetched -->
		<div v-if="isLoading" class="loading-animation">
			<p>Loading...</p>
		</div>

		<!-- Show the profile content only when data is fully loaded -->
		<div v-else>
			<h1>{{ user.name }}</h1>

			<!-- Date Picker for Filtering -->
			<div class="date-filter">
				<label for="filter-date">Filter by Date:</label>
				<input type="date" id="filter-date" v-model="filterDate" />
			</div>

			<!-- Trades Summary component, only filtered by date -->
			<div v-if="filterDate" class="trades">
				<TradesSummary :filterDate="filterDate" />
			</div>
		</div>
	</div>
</template>

<script>
import TradesSummary from "./partials/TradesSummary.vue";

export default {
	data() {
		return {
			user: null,
			filterDate: "",
			isLoading: true,
		};
	},
	components: {
		TradesSummary,
	},
	mounted() {
		this.fetchUserData();
	},
	methods: {
		async fetchUserData() {
			this.isLoading = true;
			try {
				await this.$store.dispatch("fetchUser");
				this.user = this.$store.getters.getUser;
				this.isLoading = false;
			} catch (error) {
				this.isLoading = false;
				console.error("Error fetching user data:", error);
			}
		},
	},
};
</script>

<style scoped>
/* Add your styles here */
</style>
