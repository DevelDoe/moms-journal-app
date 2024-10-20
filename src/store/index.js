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
	},
	mutations: {
		setUser(state, user) {
			state.user = user;
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

		// Fetch the user's accounts from the backend
		async fetchAccounts({ commit, state }) {
			try {
				if (state.token) {
					// Set the axios authorization header with the stored token
					axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;

					// Make a GET request to the '/api/user/accounts' endpoint
					const response = await axios.get("/api/user/accounts");

					// Commit the fetched accounts to the state
					commit("setAccounts", response.data);
					debouncedSuccessToast("Accounts fetched successfully!");
				}
			} catch (error) {
				console.error("Failed to fetch accounts:", error);
				const message = error.response?.data?.msg || "Error fetching accounts.";
				debouncedErrorToast(message);
			}
		},

		// Add a new account to the user's profile
		async addUserAccount({ commit, state }, accountData) {
			try {
				const response = await axios.post("http://localhost:5000/api/user/add-account", accountData, {
					headers: { Authorization: `Bearer ${state.token}` },
				});
				commit("setUser", response.data);
				debouncedSuccessToast("Account added successfully!");
			} catch (error) {
				const message = error.response?.data?.msg || "Error adding account.";
				debouncedErrorToast(message);
			}
		},

		// Remove an account from the user's profile
		async removeUserAccount({ commit, state }, accountNumber) {
			try {
				const response = await axios.delete(`/api/user/remove-account/${accountNumber}`, {
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
				console.log("Orders response:", response); // Log the response on client-side
				commit("setOrders", response.data); // Store orders in Vuex
				debouncedSuccessToast("Orders fetched successfully!");

				// Now that orders are fetched, calculate trades
				dispatch("fetchTrades");
			} catch (error) {
				const message = error.response?.data?.msg || "Error fetching orders.";
				debouncedErrorToast(message);
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
		async createMultipleOrders({ commit, state }, ordersData) {
			try {
				// Send all orders in a single request
				const response = await axios.post(
					"http://localhost:5000/api/orders",
					{ orders: ordersData }, // Send orders as a batch in a single request
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

		async fetchTrades({ commit, state }) {
			const trades = detectTrades(state.orders); // Now detectTrades returns the array directly
			commit("setTrades", trades); // Commit the trades array directly
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
		async createBrokerAction({ commit }, brokerData) {
			try {
				const response = await axios.post("http://localhost:5000/api/brokers", brokerData);
				commit("addBroker", response.data);
				debouncedSuccessToast(`Broker '${response.data.name}' created successfully!`);
			} catch (error) {
				console.error("Error creating broker:", error);
				const message = error.response?.data?.msg || "Error creating broker.";
				debouncedErrorToast(message);
				throw error;
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
		async addAccountAction({ dispatch }, { brokerId, account }) {
			try {
				const response = await axios.post(`http://localhost:5000/api/brokers/${brokerId}/accounts`, account);

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

		// Store: Update Account Action (with database request)
		async updateAccountAction({ dispatch }, { brokerId, account }) {
			try {
				await axios.put(`http://localhost:5000/api/brokers/${brokerId}/accounts/${account.type}`, account);

				// After successfully updating the account, fetch all brokers to refresh the store
				await dispatch("fetchBrokers");

				debouncedSuccessToast(`Account "${account.type}" updated successfully!`);
			} catch (error) {
				console.error("Error updating account:", error);
				const message = error.response?.data?.msg || "Error updating account.";
				debouncedErrorToast(message);
				throw error;
			}
		},

		async deleteAccount() {
			try {
				const payload = {
					brokerId: this.selectedBroker,
					accountType: this.selectedAccount.type,
				};
				await this.$store.dispatch("deleteAccount", payload);
				this.selectedAccount = null; // Reset account selection
				await this.$store.dispatch("fetchBrokers"); // Refresh broker list

				debouncedSuccessToast(`Account '${payload.accountType}' deleted successfully!`);
			} catch (error) {
				const message = error.response?.data?.msg || "Error deleting account.";
				debouncedErrorToast(message);
				if (process.env.NODE_ENV === "development") {
					console.error("Error deleting account from broker:", error);
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
			return state.selectedBrokerDetails; // Getter for the broker details by account type
		},
	},
});

function detectTrades(orders) {
	orders.sort((a, b) => new Date(a.date) - new Date(b.date));

	const trades = [];
	const positions = {}; // Track positions by symbol and account

	for (const order of orders) {
		const key = `${order.symbol}-${order.account}`;

		if (!positions[key]) {
			positions[key] = {
				avgPrice: 0,
				position: 0,
			};
		}

		const currentPosition = positions[key];

		if (order.side === "buy" || order.side === "BOT") {
			if (currentPosition.position < 0) {
				// Covering a short position
				let quantityToCover = Math.min(-currentPosition.position, order.quantity);
				let remainingQuantity = order.quantity - quantityToCover;

				// Calculate profit/loss for covering shorts
				const profitLoss = (currentPosition.avgPrice - order.price) * quantityToCover;

				trades.push({
					symbol: order.symbol,
					account: order.account,
					quantity: quantityToCover,
					shortPrice: currentPosition.avgPrice,
					coverPrice: order.price,
					side: "short_cover",
					date: order.date, // Adding date
					profitLoss: profitLoss,
				});

				currentPosition.position += quantityToCover; // Reduce short position

				// If there is remaining quantity, it is now a new long position
				if (remainingQuantity > 0) {
					currentPosition.avgPrice = order.price; // Set avg price for the new long position
					currentPosition.position += remainingQuantity; // Add to the position
				}
			} else {
				// Adding to a long position or initiating a new one
				const newTotalQuantity = currentPosition.position + order.quantity;
				currentPosition.avgPrice = (currentPosition.avgPrice * currentPosition.position + order.price * order.quantity) / newTotalQuantity;
				currentPosition.position = newTotalQuantity;
			}
		} else if (order.side === "sell" || order.side === "SLD") {
			if (currentPosition.position > 0) {
				// Selling from a long position
				let quantityToSell = Math.min(currentPosition.position, order.quantity);
				let remainingQuantity = order.quantity - quantityToSell;

				// Calculate profit/loss for reducing longs
				const profitLoss = (order.price - currentPosition.avgPrice) * quantityToSell;

				trades.push({
					symbol: order.symbol,
					account: order.account,
					quantity: quantityToSell,
					buyPrice: currentPosition.avgPrice,
					sellPrice: order.price,
					side: "long_sell",
					date: order.date, // Adding date
					profitLoss: profitLoss,
				});

				currentPosition.position -= quantityToSell; // Reduce long position

				// If there is remaining quantity, it is now a short position
				if (remainingQuantity > 0) {
					currentPosition.avgPrice = order.price; // Set avg price for the new short position
					currentPosition.position -= remainingQuantity; // Move into a short position
				}
			} else {
				// Initiating or adding to a short position
				const newTotalQuantity = currentPosition.position - order.quantity;
				currentPosition.avgPrice =
					(Math.abs(currentPosition.avgPrice * currentPosition.position) + order.price * order.quantity) / Math.abs(newTotalQuantity);
				currentPosition.position = newTotalQuantity;
			}
		}
	}

	return trades; // Return the array directly
}
