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

            <!-- Section to delete user data -->
            <div class="delete-data">
                <h3>Delete My Data</h3>
                <p>Deleting your data will remove all trades, orders, and summaries associated with your account. This action is irreversible.</p>
                <label for="startDate">Start Date (optional):</label>
                <input v-model="startDate" type="date" id="startDate" />

                <label for="endDate">End Date (optional):</label>
                <input v-model="endDate" type="date" id="endDate" />

                <button @click="deleteMyData">Delete My Data</button>
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
            startDate: "", // Optional start date for data deletion
            endDate: "", // Optional end date for data deletion
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
        async deleteMyData() {
            try {
                // Directly fetch the user ID from the store
                const userId = this.user?.id;

                if (!userId) {
                    throw new Error("User ID is missing. Please refresh the page and try again.");
                }

                // Confirm deletion with the user
                const confirmDelete = window.confirm("This action will permanently delete your data. Are you sure?");
                if (!confirmDelete) return;

                // Dispatch the action to delete data
                await this.$store.dispatch("deleteUserData", {
                    userId,
                    start: this.startDate || null, // Optional date filter
                    end: this.endDate || null, // Optional date filter
                });

                // Reset the date fields after successful deletion
                this.startDate = "";
                this.endDate = "";
            } catch (error) {
                console.error("Error deleting data:", error);
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

.add-account,
.delete-data {
    margin-top: 20px;
}

.add-account label,
.delete-data label {
    margin-right: 10px;
}

button {
    margin-top: 10px;
    padding: 10px;
}
</style>
