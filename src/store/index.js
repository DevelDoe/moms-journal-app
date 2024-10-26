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
		summaries: [],
	},
	mutations: {
		setUser(state, userData) {
			if (!state.user) {
				state.user = {};
			}
			Object.assign(state.user, userData);
		},
		setToken(state, token) {
			state.token = token;
			if (token) {
				localStorage.setItem("token", token);
			} else {
				localStorage.removeItem("token");
			}
		},
		clearState(state) {
			state.user = null;
			state.token = "";
			state.orders = [];
			state.trades = [];
			localStorage.removeItem("token");
		},
		addOrder(state, order) {
			if (!state.orders) {
				state.orders = []; // Ensure orders array exists
			}
			state.orders.push(order);
		},
		setOrders(state, orders) {
			state.orders = orders;
		},
		setTrades(state, trades) {
			state.trades = trades;
		},
		setSummaries(state, summaries) {
			state.summaries = summaries;
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
		async fetchOrders({ commit, dispatch, state }) {
			try {
				const response = await axios.get("http://localhost:5000/api/orders", {
					headers: { Authorization: `Bearer ${state.token}` },
				});
				console.log("Orders Response:", response.data);

				commit("setOrders", response.data);
				
				console.log("State after setOrders:", state.orders);
			} catch (error) {
				console.error("Error fetching orders:", error);
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
		async createMultipleOrders({ commit, state }, { orders }) {
			try {
				// Send orders directly
				const response = await axios.post(
					"http://localhost:5000/api/orders",
					{ orders }, // Send the orders as they are
					{
						headers: { Authorization: `Bearer ${state.token}` },
					}
				);

				// Fetch updated orders, trades, and summaries after successful order upload
				await Promise.all([
					dispatch("fetchOrders"),
					dispatch("fetchTrades"),
					dispatch("fetchAllSummaries"),
				]);

				debouncedSuccessToast("Orders, trades, and summaries updated successfully!");
				toastSent = true;
			} catch (error) {
				const message = error.response?.data?.error || "Error uploading orders.";
				debouncedErrorToast(message);
			}
		},
		async fetchOrders({ commit, dispatch, state }) {
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
		getOrders: (state) => state.orders,
		getTrades: (state) => state.trades,
		getSummaries: (state) => state.summaries,
	},
});
