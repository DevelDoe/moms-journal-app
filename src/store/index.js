import { createStore } from "vuex";
import axios from "axios";
import debounce from "lodash/debounce";
import moment from "moment";
import { isTokenExpired } from "../utils/auth";
import { showToast } from "../utils/toast";

// Set global Axios configuration
axios.defaults.baseURL = "http://localhost:5000/api";
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token") || ""}`;

let isFetchingUser = false;

export default createStore({
    state: {
        user: null,
        token: localStorage.getItem("token") || null,
        orders: [],
        trades: [],
        summaries: [],
        startDate: moment().startOf("month").format("YYYY-MM-DD"),
        endDate: moment().endOf("month").format("YYYY-MM-DD"),
    },
    mutations: {
        setUser(state, userData) {
            console.log(userData);
            state.user = userData ? { ...userData } : null; // Ensures reactivity
        },
        setToken(state, token) {
            state.token = token;
            if (token) {
                localStorage.setItem("token", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            } else {
                localStorage.removeItem("token");
                delete axios.defaults.headers.common["Authorization"];
            }
        },
        clearState(state) {
            console.log("Clearing state...");
            state.user = null;
            state.token = null; // Consistency
            state.orders = [];
            state.trades = [];
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
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
        async loginAction({ commit, dispatch }, { email, password }) {
            try {
                const response = await axios.post("/auth/login", { email, password });
                const { accessToken, user } = response.data;
        
                commit("setToken", accessToken);
                commit("setUser", user); // Directly update the user
                
                await dispatch("setDefaultDates");
                await dispatch("fetchTrades"); // Fetch trades once after login
        
                showToast.success("Logged in successfully!");
                return true;
            } catch (error) {
                const message = error.response?.data?.msg || "Login failed. Please try again.";
                showToast.error(message);
                return false;
            }
        },
        async fetchUser({ commit, dispatch, state }) {
            if (isFetchingUser) return;
            isFetchingUser = true;

            try {
                // Check token expiration
                if (state.token && isTokenExpired(state.token)) {
                    const refreshed = await dispatch("refreshToken");
                    if (!refreshed) {
                        throw new Error("Session expired. Please log in again.");
                    }
                }

                const response = await axios.get("/user/profile");
                commit("setUser", response.data.user); // Update the user data
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                showToast.error("Failed to fetch user data. Please log in again.");
                commit("clearState"); // Clear state only after notifying the user
            } finally {
                isFetchingUser = false;
            }
        },
        async refreshToken({ commit }) {
            try {
                const response = await axios.post("/auth/refresh-token");
                const { accessToken } = response.data;
        
                commit("setToken", accessToken);
                return true;
            } catch (error) {
                console.error("Failed to refresh token:", error);
                commit("clearState"); // Clear state when refresh fails
                return false;
            }
        },
        logout({ commit }, router) {
            axios.post("/auth/logout").catch((err) => console.error("Logout error:", err));
            commit("clearState");
            showToast.success("Logged out successfully!");
            if (router) router.push("/");
        },
        updateDateRange({ commit, dispatch }, { start, end }) {
            commit("setStartDate", start);
            commit("setEndDate", end);
            dispatch("fetchTrades"); // Fetch trades after date update
        },
        setDefaultDates({ commit }) {
            const currentMonthStart = moment().startOf("month").format("YYYY-MM-DD");
            const currentDate = moment().format("YYYY-MM-DD");
            commit("setStartDate", currentMonthStart);
            commit("setEndDate", currentDate);
        },
        async addAccount({ commit }, accountData) {
            try {
                const response = await axios.post("/user/account", accountData);
                const updatedUser = response.data.user || response.data; // Ensure proper user structure
                commit("setUser", updatedUser);
                showToast.success("Account added successfully!");
            } catch (error) {
                const message = error.response?.data?.msg || "Failed to add account.";
                showToast.error(message);
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
                showToast.success("Orders, trades, and summaries updated successfully!");
                return response.data.trades;
            } catch (error) {
                const message = error.response?.data?.error || "Error uploading orders.";
                showToast.error(message);
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
