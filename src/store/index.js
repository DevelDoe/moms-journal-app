// ./src/store/index.js

import { createStore } from "vuex";
import axios from "axios";
import { useToast } from "vue-toastification";
import debounce from "lodash/debounce";
import moment from "moment";

const toast = useToast();

// Set global Axios configuration
axios.defaults.baseURL = "http://localhost:5000/api"; // Global base URL
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token") || ""}`;

const debouncedSuccessToast = debounce((message) => toast.success(message), 2000, { leading: true, trailing: false });
const debouncedErrorToast = debounce((message) => toast.error(message), 2000, { leading: true, trailing: false });

export default createStore({
	state: {
		user: null,
		token: localStorage.getItem("token") || "",
		orders: [],
		trades: [],
		summaries: [],
		startDate: moment().startOf("month").format("YYYY-MM-DD"),
		endDate: moment().endOf("month").format("YYYY-MM-DD"),
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
				axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Set token globally
			} else {
				localStorage.removeItem("token");
				delete axios.defaults.headers.common["Authorization"]; // Remove token from global headers
			}
		},
		clearState(state) {
			state.user = null;
			state.token = "";
			state.orders = [];
			state.trades = [];
			localStorage.removeItem("token");
			delete axios.defaults.headers.common["Authorization"];
		},
		addOrder(state, order) {
			if (!state.orders) {
				state.orders = [];
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
		setStartDate(state, date) {
			state.startDate = date;
		},
		setEndDate(state, date) {
			state.endDate = date;
		},
	},
	actions: {
		updateDateRange({ commit }, { start, end }) {
			commit("setStartDate", start);
			commit("setEndDate", end);
		},
		setDefaultDates({ commit }) {
			const currentMonthStart = moment().startOf("month").format("YYYY-MM-DD");
			const currentDate = moment().format("YYYY-MM-DD");
			commit("setStartDate", currentMonthStart);
			commit("setEndDate", currentDate);
		},
		async loginAction({ commit, dispatch }, { email, password }) {
			try {
				const response = await axios.post("/auth/login", { email, password });
				const { token, user } = response.data;

				commit("setToken", token);
				commit("setUser", user);

				await dispatch("setDefaultDates");
				await dispatch("fetchTrades"); // Fetch trades once after login

				debouncedSuccessToast("Logged in successfully!");

				return true;
			} catch (error) {
				const message = error.response?.data?.msg || "Login failed. Please try again.";
				debouncedErrorToast(message);
				return false;
			}
		},
		async fetchUser({ commit, state }) {
			if (state.token) {
				try {
					const response = await axios.get("/user/profile");
					commit("setUser", response.data);
					debouncedSuccessToast(`Welcome back, ${response.data.name}`);
				} catch (error) {
					this.handleAuthError(commit, error);
				}
			}
		},
		handleAuthError(commit, error) {
			if (error.response?.status === 401) {
				commit("clearState");
				debouncedErrorToast("Session expired. Please log in again.");
			} else {
				const message = error.response?.data?.msg || "Error fetching user.";
				debouncedErrorToast(message);
			}
		},
		async updateUser({ commit }, updatedUserData) {
			try {
				const response = await axios.put("/auth/update-profile", updatedUserData);
				commit("setUser", response.data);
				debouncedSuccessToast("Profile updated successfully!");
			} catch (error) {
				const message = error.response?.data?.msg || "Error updating profile.";
				debouncedErrorToast(message);
			}
		},
		async addAccount({ commit }, accountData) {
			try {
				const response = await axios.post("/user/account", accountData);
				commit("setUser", response.data);
				debouncedSuccessToast("Account added successfully!");
			} catch (error) {
				const message = error.response?.data?.msg || "Failed to add account.";
				debouncedErrorToast(message);
			}
		},
		async createMultipleOrders({ commit, dispatch }, { orders }) {
			try {
				const response = await axios.post("/orders", { orders });

				if (response.status === 201) {
					await dispatch("fetchOrders");
					await dispatch("fetchTrades");
					await dispatch("fetchAllSummaries");
				}

				debouncedSuccessToast("Orders, trades, and summaries updated successfully!");
				return response.data.trades;
			} catch (error) {
				const message = error.response?.data?.error || "Error uploading orders.";
				debouncedErrorToast(message);
			}
		},

		async fetchOrders({ commit }) {
			try {
				const response = await axios.get("/orders");
				commit("setOrders", response.data);
			} catch (error) {
				console.error("Error fetching orders:", error);
			}
		},

		updateDateRange({ commit, dispatch }, { start, end }) {
			commit("setStartDate", start);
			commit("setEndDate", end);
			dispatch("fetchTrades"); // Fetch trades after date update
		},

		async fetchTrades({ commit, state }) {
			try {
				const { startDate, endDate } = state;
				const response = await axios.get("/trades", {
					params: { start: startDate, end: endDate },
				});
				commit("setTrades", response.data);
			} catch (error) {
				console.error("Error fetching trades:", error);
			}
		},

		async fetchAllSummaries({ commit }) {
			try {
				const response = await axios.get("/trades/summaries");
				commit("setSummaries", response.data);
			} catch (error) {
				console.error("Error fetching summaries:", error);
			}
		},
		async fetchFilteredSummaries({ commit }, { minProfit, maxProfit, minTrades, maxTrades, date }) {
			try {
				const response = await axios.get("/trades/summaries/filter", {
					params: { minProfit, maxProfit, minTrades, maxTrades, date },
				});
				commit("setSummaries", response.data);
			} catch (error) {
				console.error("Error fetching filtered summaries:", error);
			}
		},
		logout({ commit }, router) {
			commit("clearState");
			debouncedSuccessToast("Logged out successfully!");
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
		getStartDate: (state) => state.startDate,
		getEndDate: (state) => state.endDate,
	},
});
