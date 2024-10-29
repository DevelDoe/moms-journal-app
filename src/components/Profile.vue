<template>
	<div id="Profile" class="container">
		<!-- Loading animation while data is being fetched -->
		<div v-if="isLoading" class="loading-animation">
			<p>Loading...</p>
		</div>

		<!-- Show the profile content only when data is fully loaded -->
		<div v-else>
			<h1>{{ user?.name || "User" }}</h1>

			<h2>Accounts</h2>
			<!-- Display a list of accounts -->
			<ul v-if="user?.accounts && user.accounts.length">
				<li v-for="account in user.accounts" :key="account._id">
					{{ account.type === "live" ? "Live Account" : "Paper Account" }}
				</li>
			</ul>
			<p v-else>No accounts added yet.</p>

			<!-- Form to add a new account -->
			<div class="add-account">
				<h3>Add New Account</h3>
				<label for="accountType">Account Type:</label>
				<select v-model="newAccountType" id="accountType">
					<option disabled value="">Select account type</option>
					<option value="live">Live</option>
					<option value="paper">Paper</option>
				</select>
				<button @click="addAccount" :disabled="!newAccountType">Add Account</button>
			</div>
		</div>
	</div>
</template>


<script>
export default {
	data() {
		return {
			user: null,
			isLoading: true,
			newAccountType: "", // Holds the selected account type for the new account
		};
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
		async addAccount() {
			try {
				// Dispatch action to add new account to the user
				await this.$store.dispatch("addAccount", { type: this.newAccountType });
				this.newAccountType = ""; // Reset the dropdown
				await this.fetchUserData(); // Refresh user data to show updated accounts
			} catch (error) {
				console.error("Error adding account:", error);
			}
		},
	},
};
</script>

<style scoped>
.loading-animation {
	font-size: 1.2em;
	margin-top: 20px;
	text-align: center;
}

.add-account {
	margin-top: 20px;
}

.add-account label {
	margin-right: 10px;
}
</style>
