// ./src/store/index.js
import { createStore } from "vuex";
import axios from "axios";
import { useToast } from "vue-toastification";
import debounce from "lodash/debounce";

const toast = useToast();

const debouncedSuccessToast = debounce((message) => toast.success(message), 2000, { leading: true, trailing: false });
const debouncedErrorToast = debounce((message) => toast.error(message), 2000, {
	leading: true,
	trailing: false,
});

export default createStore({
	state: {
		user: null,
		token: localStorage.getItem("token") || "",
		orders: [],
		trades: [],
		brokers: [],
		accounts: [],
		selectedBrokerDetails: null,
		summaries: [],
		ordersByAccount: [],
	},
	mutations: {
		setUser(state, userData) {
			if (!state.user) {
				state.user = {};
			}
			Object.assign(state.user, userData);
		},
		addUserAccount(state, account) {
			if (!state.user || !state.user.accounts) {
				state.user = { ...state.user, accounts: [] }; // Ensure user and accounts exist
			}
			state.user.accounts.push(account);
		},
		removeUserAccount(state, accountNumber) {
			if (state.user && state.user.accounts) {
				state.user.accounts = state.user.accounts.filter((account) => account.number !== accountNumber);
			}
		},
		setSelectedBrokerDetails(state, broker) {
			state.selectedBrokerDetails = broker; // Store the fetched broker details
		},
		setToken(state, token) {
			state.token = token;
			if (token) {
				localStorage.setItem("token", token);
			} else {
				localStorage.removeItem("token");
			}
		},
		setOrders(state, orders) {
			state.orders = orders;
		},
		addOrder(state, order) {
			if (!state.orders) {
				state.orders = []; // Ensure orders array exists
			}
			state.orders.push(order);
		},
		clearState(state) {
			state.user = null;
			state.token = "";
			state.orders = [];
			state.trades = [];
			localStorage.removeItem("token");
		},
		setTrades(state, trades) {
			state.trades = trades;
		},
		setBrokers(state, brokers) {
			state.brokers = brokers; // Replace the entire brokers array
		},
		setBroker(state, updatedBroker) {
			if (state.brokers) {
				const index = state.brokers.findIndex((broker) => broker._id === updatedBroker._id);
				if (index !== -1) {
					state.brokers.splice(index, 1, updatedBroker); // Update the broker in the brokers array
				}
			}
		},
		addBroker(state, broker) {
			if (!state.brokers) {
				state.brokers = []; // Ensure brokers array exists if not already initialized
			}
			state.brokers.push(broker); // Append the newly created broker to the brokers array
		},
		setSummaries(state, summaries) {
			state.summaries = summaries;
		},
		setOrdersByAccount(state, orders) {
			state.ordersByAccount = orders; // Set the fetched orders in state
		},
	},
	actions: {
		async loginAction({ commit, dispatch }, { email, password }) {
			try {
				// Make the login request
				const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
				const { token, user } = response.data;

				// Set the token and user data in Vuex
				commit("setToken", token);
				commit("setUser", user);
				debouncedSuccessToast("Logged in successfully!");

				// Immediately fetch orders in the background after successful login
				await dispatch("fetchOrders");
				return true;
			} catch (error) {
				const message = error.response?.data?.msg || "Login failed. Please try again.";
				debouncedErrorToast(message);
				return false;
			}
		},
		async fetchUser({ commit, state }) {
			try {
				if (state.token) {
					// Set the axios header for authorization
					axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;

					// Use the /profile endpoint to fetch user information
					const response = await axios.get("http://localhost:5000/api/user/profile");

					// Commit the user information to Vuex
					commit("setUser", response.data);
					debouncedSuccessToast(`Welcome back, ${response.data.name}`);
				}
			} catch (error) {
				console.error("Failed to fetch user data:", error);
				const message = error.response?.data?.msg || "Error fetching user.";
				debouncedErrorToast(message);
				commit("setToken", null);
				commit("setUser", null);
				localStorage.removeItem("token");
			}
		},
		async updateUser({ commit, state }, updatedUserData) {
			try {
				const response = await axios.put("/api/auth/update-profile", updatedUserData, {
					headers: { Authorization: `Bearer ${state.token}` },
				});
				commit("setUser", response.data);
				debouncedSuccessToast("Profile updated successfully!");
			} catch (error) {
				const message = error.response?.data?.msg || "Error updating profile.";
				debouncedErrorToast(message);
			}
		},
		async fetchAccountSpecifications(accountId) {
			try {
				const response = await axios.get(`http://localhost:5000/api/brokers/accounts/${accountId}`);
				return response.data; // Return the account specifications
			} catch (error) {
				console.error("Error fetching account specifications:", error);
				throw error; // Re-throw for further handling if needed
			}
		},
		// Fetch the user's accounts from the backend
		async addUserAccount({ commit, state }, accountData) {
			try {
				const brokerResponse = await axios.get(`http://localhost:5000/api/brokers/${accountData.brokerId}`);
				const broker = brokerResponse.data;

				const accountTypeDetails = broker.accountTypes.find((accountType) => accountType._id === accountData.accountId);

				const newAccount = {
					type: accountTypeDetails.type,
					brokerId: accountData.brokerId,
					accountId: accountData.accountId,
					number: accountData.number,
					balance: accountData.balance || 0,
					specifications: accountTypeDetails,
				};

				const response = await axios.post("http://localhost:5000/api/user/add-account", newAccount, {
					headers: { Authorization: `Bearer ${state.token}` },
				});

				commit("addUserAccount", response.data); // Commit the new account only
				debouncedSuccessToast("Account added successfully!");
			} catch (error) {
				const message = error.response?.data?.msg || "Error adding account.";
				debouncedErrorToast(message);
			}
		},
		// Remove an account from the user's profile
		async removeUserAccount({ commit, state }, accountId) {
			try {
				const response = await axios.delete(`http://localhost:5000/api/user/remove-account/${accountId}`, {
					headers: { Authorization: `Bearer ${state.token}` },
				});
				commit("setUser", response.data);
				debouncedSuccessToast("Account removed successfully!");
			} catch (error) {
				const message = error.response?.data?.msg || "Error removing account.";
				debouncedErrorToast(message);
			}
		},
		// Fetch user orders from the backend
		async fetchOrders({ commit, dispatch, state }) {
			try {
				const response = await axios.get("http://localhost:5000/api/orders", {
					headers: { Authorization: `Bearer ${state.token}` },
				});
				commit("setOrders", response.data); // Store orders in Vuex
				debouncedSuccessToast("Orders fetched successfully!");
			} catch (error) {
				const message = error.response?.data?.msg || "Error fetching orders.";
				debouncedErrorToast(message);
			}
		},
		async fetchOrdersByAccountId({ commit, state }, accountId) {
			try {
				// Log to check if the correct accountId and token are being sent
				console.log("Fetching orders for accountId:", accountId, "Token:", state.token);

				// Make the API request
				const response = await axios.get(`http://localhost:5000/api/orders/${accountId}`, {
					headers: { Authorization: `Bearer ${state.token}` }, // Ensure token is correctly set
				});

				// Commit the result to Vuex store
				commit("setOrdersByAccount", response.data); // Pass the response data to the mutation

				// Return the data to the caller
				return response.data;
			} catch (error) {
				// Log the error to catch any issues
				console.error("Error fetching orders:", error);
				throw error;
			} finally {
				// Perform any cleanup or reset loading state if needed
			}
		},
		async createOrder({ commit, state }, orderData) {
			try {
				const response = await axios.post("http://localhost:5000/api/orders", orderData, {
					headers: { Authorization: `Bearer ${state.token}` },
				});
				commit("addOrder", response.data); // Add the new order to Vuex
				debouncedSuccessToast("Order created successfully!");
			} catch (error) {
				const message = error.response?.data?.msg || "Error creating order.";
				debouncedErrorToast(message); // Debounced error toast
			}
		},
		// Function to create multiple orders
		async createMultipleOrders({ commit, state }, { orders }) {
			try {
				// Send orders directly, assuming accountId is already included in the parsed order
				const response = await axios.post(
					"http://localhost:5000/api/orders",
					{ orders }, // Just send the orders as they are
					{
						headers: { Authorization: `Bearer ${state.token}` },
					}
				);

				// Commit the orders and show success toast
				response.data.orders.forEach((order) => {
					commit("addOrder", order); // Add each uploaded order to Vuex
				});

				debouncedSuccessToast("All orders uploaded successfully!");
			} catch (error) {
				const message = error.response?.data?.error || "Error uploading orders.";
				debouncedErrorToast(message);
			}
		},
		// Fetch trades from the backend
		async fetchTrades({ commit, state }) {
			try {
				// Make an API request to fetch trades for the user
				const response = await axios.get("http://localhost:5000/api/trades", {
					headers: { Authorization: `Bearer ${state.token}` },
				});

				// Commit the fetched trades to the state
				commit("setTrades", response.data);
				debouncedSuccessToast("Trades fetched successfully!");
			} catch (error) {
				const message = error.response?.data?.msg || "Error fetching trades.";
				debouncedErrorToast(message);
				console.error("Error fetching trades:", error);
			}
		},
		async fetchTradesByAccount({ commit, state }, accountId) {
			try {
				const response = await axios.get(`http://localhost:5000/api/trades/${accountId}`, {
					headers: { Authorization: `Bearer ${state.token}` },
				});

				const trades = response.data; // Assuming this is where the trades are stored
				commit("setTrades", trades); // Commit to Vuex state
				return trades; // <-- Make sure to return the trades here
			} catch (error) {
				console.error("Error fetching trades:", error);
				throw error;
			}
		},
		// Action to fetch all summaries
		async fetchAllSummaries({ commit, state }) {
			try {
				const response = await axios.get("http://localhost:5000/api/trades/summaries", {
					headers: { Authorization: `Bearer ${state.token}` },
				});
				commit("setSummaries", response.data); // Store summaries in Vuex
			} catch (error) {
				console.error("Error fetching summaries:", error);
			}
		},
		// Action to fetch filtered summaries
		async fetchFilteredSummaries({ commit, state }, { minProfit, maxProfit, minTrades, maxTrades, date }) {
			try {
				const response = await axios.get("http://localhost:5000/api/trades/summaries/filter", {
					headers: { Authorization: `Bearer ${state.token}` },
					params: { minProfit, maxProfit, minTrades, maxTrades, date },
				});
				commit("setSummaries", response.data); // Store filtered summaries in Vuex
			} catch (error) {
				console.error("Error fetching filtered summaries:", error);
			}
		},
		// Fetch all brokers from the backend
		async fetchBrokers({ commit }) {
			try {
				const response = await axios.get("http://localhost:5000/api/brokers");
				commit("setBrokers", response.data);
				debouncedSuccessToast("Brokers fetched successfully!");
			} catch (error) {
				console.error("Error fetching brokers:", error);
				const message = error.response?.data?.msg || "Error fetching brokers.";
				debouncedErrorToast(message);
			}
		},
		// Create a new broker in the backend
		async createBrokerAction({ commit, state }, brokerData) {
			try {
				// Include token in the headers if the user is authenticated
				const response = await axios.post("http://localhost:5000/api/brokers", brokerData, {
					headers: {
						Authorization: `Bearer ${state.token}`, // Ensure the token is in the state
					},
				});

				commit("addBroker", response.data);
				debouncedSuccessToast(`Broker '${response.data.name}' created successfully!`);
			} catch (error) {
				console.error("Error creating broker:", error);
				const message = error.response?.data?.msg || "Error creating broker.";
				debouncedErrorToast(message);
				throw error; // Optional: Rethrow the error for further handling
			}
		},
		// Store: Update Broker Action (with database request)
		async updateBrokerAction({ commit }, { brokerId, broker }) {
			try {
				const response = await axios.put(`http://localhost:5000/api/brokers/${brokerId}`, broker);

				// Optional: update broker in the store if you want
				commit("setBroker", response.data);

				debouncedSuccessToast(`Broker "${response.data.name}" updated successfully!`);
			} catch (error) {
				console.error("Error updating broker:", error);
				const message = error.response?.data?.msg || "Error updating broker.";
				debouncedErrorToast(message);
				throw error;
			}
		},
		async deleteBroker() {
			try {
				const broker = this.brokers.find((b) => b._id === this.selectedBroker);
				const brokerName = broker ? broker.name : "Unknown broker";

				await this.$store.dispatch("deleteBroker", this.selectedBroker);
				this.selectedBroker = ""; // Reset selection
				this.showAccountForm = false;
				await this.$store.dispatch("fetchBrokers"); // Refresh broker list

				debouncedSuccessToast(`Broker '${brokerName}' deleted successfully!`);
			} catch (error) {
				const message = error.response?.data?.msg || "Error deleting broker.";
				debouncedErrorToast(message);
				if (process.env.NODE_ENV === "development") {
					console.error("Error deleting broker:", error);
				}
			}
		},
		// Add a new account type to an existing broker
		async addAccountAction({ dispatch, state }, { brokerId, account }) {
			try {
				const response = await axios.post(`http://localhost:5000/api/brokers/${brokerId}/accounts`, account, {
					headers: {
						Authorization: `Bearer ${state.token}`, // Use state.token correctly here
					},
				});

				// After successfully adding the account, fetch all brokers to refresh the store
				await dispatch("fetchBrokers");

				debouncedSuccessToast(`Account '${response.data.type}' added successfully!`);
			} catch (error) {
				const message = error.response?.data?.msg || "Error adding account.";
				debouncedErrorToast(message);
				if (process.env.NODE_ENV === "development") {
					console.error("Error adding account to broker:", error);
				}
			}
		},
		// Update an account type for a broker
		async updateAccountAction({ dispatch, state }, { brokerId, account }) {
			try {
				const response = await axios.put(
					`http://localhost:5000/api/brokers/${brokerId}/accounts/${account._id}`, // Use account ID here
					account,
					{
						headers: {
							Authorization: `Bearer ${state.token}`, // Include token in the header
						},
					}
				);

				// After successfully updating the account, refresh the brokers
				await dispatch("fetchBrokers");

				debouncedSuccessToast(`Account '${account.type}' updated successfully!`);
			} catch (error) {
				console.error("Error updating account:", error);
				const message = error.response?.data?.msg || "Error updating account.";
				debouncedErrorToast(message);
				throw error;
			}
		},
		async deleteAccountAction({ dispatch, state }, { brokerId, accountId }) {
			try {
				await axios.delete(`http://localhost:5000/api/brokers/${brokerId}/accounts/${accountId}`, {
					headers: {
						Authorization: `Bearer ${state.token}`,
					},
				});

				await dispatch("fetchBrokers"); // Refresh brokers after deletion
				debouncedSuccessToast("Account deleted successfully!");
			} catch (error) {
				const message = error.response?.data?.msg || "Error deleting account.";
				debouncedErrorToast(message);
				if (process.env.NODE_ENV === "development") {
					console.error("Error deleting account:", error);
				}
			}
		},
		// Fetch the broker based on account type
		async fetchBrokerByAccountType({ commit }, accountType) {
			try {
				const response = await axios.get(`/api/brokers/account/${accountType}`);
				commit("setSelectedBrokerDetails", response.data); // Commit the broker details to the store
			} catch (error) {
				console.error("Error fetching broker by account type:", error.message);
				const message = error.response?.data?.msg || "Error fetching broker by account type.";
				debouncedErrorToast(message);
			}
		},
		// Logout action to clear the state
		logout({ commit }, router) {
			// Clear the state
			commit("clearState");

			// Show success toast
			debouncedSuccessToast("Logged out successfully!");

			// Use the router to navigate to the home page if it is passed in correctly
			if (router) {
				router.push("/");
			}
		},
	},
	getters: {
		isAuthenticated: (state) => !!state.token,
		getUser: (state) => state.user,
		getUserAccounts: (state) => (state.user ? state.user.accounts : []),
		getOrders: (state) => state.orders,
		getTrades: (state) => state.trades,
		getBrokers: (state) => state.brokers,
		getAccounts: (state) => state.accounts,
		getBrokerByAccountType(state) {
			return state.selectedBrokerDetails;
		},
		getSummaries(state) {
			return state.summaries;
		},
		getOrdersByAccount: (state) => state.ordersByAccount,
	},
});
