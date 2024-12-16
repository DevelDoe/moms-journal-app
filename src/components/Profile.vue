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
			isLoading: true, // Start with loading true
			newAccountType: "", // Holds the selected account type
		};
	},
	computed: {
		user() {
			return this.$store.getters.getUser; // Bind directly to Vuex store
		},
	},
	watch: {
		// Watch for changes to 'user' and stop loading when data is available
		user(newUser) {
			if (newUser) {
				this.isLoading = false; // Stop loading when user data exists
			}
		},
	},
	created() {
		// Set loading to false immediately if user is already in store
		if (this.$store.getters.getUser) {
			this.isLoading = false;
		}
	},
	methods: {
		async addAccount() {
			try {
				await this.$store.dispatch("addAccount", { type: this.newAccountType });
				this.newAccountType = ""; // Reset the dropdown
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
