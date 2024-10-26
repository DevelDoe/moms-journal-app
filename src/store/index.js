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
		refreshToken: localStorage.getItem("refreshToken") || "",
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
		setToken(state, { token, refreshToken }) {
			state.token = token;
			state.refreshToken = refreshToken;
			localStorage.setItem("token", token);
			localStorage.setItem("refreshToken", refreshToken);
		},
		clearToken(state) {
			state.token = "";
			state.refreshToken = "";
			localStorage.removeItem("token");
			localStorage.removeItem("refreshToken");
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
				// Decode token to check expiration (Optional, but helps to avoid extra requests)
				const decodedToken = jwtDecode(state.token);
				const isTokenExpired = decodedToken.exp * 1000 < Date.now();
				if (isTokenExpired) {
				  await dispatch("refreshToken"); // Refresh the token if expired
				}

				 // Set authorization header
				 axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
				 const response = await axios.get("http://localhost:5000/api/user/profile");
				 commit("setUser", response.data);
				
			} catch (error) {
				console.error("Failed to fetch user data:", error);
				const message = error.response?.data?.msg || "Error fetching user.";
				debouncedErrorToast(message);
				console.error("Error fetching user:", error);
       			commit("clearToken");
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
		async createMultipleOrders({ commit, dispatch, state }, { orders }) {
			try {
				console.log("Starting createMultipleOrders action...");

				const response = await axios.post(
					"http://localhost:5000/api/orders",
					{ orders },
					{
						headers: { Authorization: `Bearer ${state.token}` },
					}
				);

				if (response.status === 201) {
					console.log("Orders uploaded successfully.");

					// Call fetch actions and add logging
					await dispatch("fetchOrders").then(() => console.log("fetchOrders completed"));
					await dispatch("fetchTrades").then(() => console.log("fetchTrades completed"));
					await dispatch("fetchAllSummaries").then(() => console.log("fetchAllSummaries completed"));
				}

				// Returns the trade for the orders uploaded
				return response.data.trades;

				debouncedSuccessToast("Orders, trades, and summaries updated successfully!");
			} catch (error) {
				const message = error.response?.data?.error || "Error uploading orders.";
				debouncedErrorToast(message);
				console.error("Error in createMultipleOrders:", error);
			}
		},

		async fetchOrders({ commit, state }) {
			try {
				console.log("Fetching orders...");
				const response = await axios.get("http://localhost:5000/api/orders", {
					headers: { Authorization: `Bearer ${state.token}` },
				});
				commit("setOrders", response.data);
			} catch (error) {
				console.error("Error fetching orders:", error);
			}
		},

		async fetchTrades({ commit, state }) {
			try {
				console.log("Fetching trades...");
				const response = await axios.get("http://localhost:5000/api/trades", {
					headers: { Authorization: `Bearer ${state.token}` },
				});
				commit("setTrades", response.data);
			} catch (error) {
				console.error("Error fetching trades:", error);
			}
		},

		async fetchAllSummaries({ commit, state }) {
			try {
				console.log("Fetching summaries...");
				const response = await axios.get("http://localhost:5000/api/trades/summaries", {
					headers: { Authorization: `Bearer ${state.token}` },
				});
				commit("setSummaries", response.data);
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
