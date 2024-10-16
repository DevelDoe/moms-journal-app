import { createStore } from "vuex";
import axios from "axios";
import { useToast } from "vue-toastification";
import debounce from "lodash/debounce";

const toast = useToast();

const debouncedSuccessToast = debounce(
	(message) => toast.success(message),
	2000,
	{ leading: true, trailing: false }
);
const debouncedErrorToast = debounce((message) => toast.error(message), 2000, {
	leading: true,
	trailing: false,
});

export default createStore({
	state: {
		user: null,
		token: localStorage.getItem("token") || "",
		orders: [],
		trades: [], // Store trades
	},
	mutations: {
		setUser(state, user) {
			state.user = user;
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
		// Add a new order to the list of orders
		addOrder(state, order) {
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
	},
	actions: {
		async loginAction({ commit, dispatch }, { email, password }) {
			try {
				// Make the login request
				const response = await axios.post(
					"http://localhost:5000/api/auth/login",
					{ email, password }
				);
				const { token, user } = response.data;

				// Set the token and user data in Vuex
				commit("setToken", token);
				commit("setUser", user);
				debouncedSuccessToast("Logged in successfully!");

				// Immediately fetch orders in the background after successful login
				await dispatch("fetchOrders");
				return true;
			} catch (error) {
				const message =
					error.response?.data?.error ||
					"Login failed. Please try again.";
				debouncedErrorToast(message);
				return false;
			}
		},

		async fetchUser({ commit, state }) {
			try {
				if (state.token) {
					// Set the axios header for authorization
					axios.defaults.headers.common[
						"Authorization"
					] = `Bearer ${state.token}`;

					// Use the /profile endpoint to fetch user information
					const response = await axios.get(
						"http://localhost:5000/api/auth/profile"
					);

					// Commit the user information to Vuex
					commit("setUser", response.data);
					debouncedSuccessToast(
						`Welcome back, ${response.data.name}`
					);
				}
			} catch (error) {
				console.error("Failed to fetch user data:", error);
				// Handle any errors such as logging out if the token is invalid
				commit("setToken", null);
				commit("setUser", null);
				localStorage.removeItem("token");
			}
		},

		// Fetch user orders from the backend
		async fetchOrders({ commit, dispatch, state }) {
			try {
				const response = await axios.get(
					"http://localhost:5000/api/orders",
					{
						headers: { Authorization: `Bearer ${state.token}` },
					}
				);
				commit("setOrders", response.data); // Store orders in Vuex
				debouncedSuccessToast("Orders fetched successfully!");

				// Now that orders are fetched, calculate trades
				dispatch("fetchTrades");
			} catch (error) {
				const message =
					error.response?.data?.error || "Error fetching orders.";
				debouncedErrorToast(message);
			}
		},

		async createOrder({ commit, state }, orderData) {
			try {
				const response = await axios.post(
					"http://localhost:5000/api/orders",
					orderData,
					{
						headers: { Authorization: `Bearer ${state.token}` },
					}
				);
				commit("addOrder", response.data); // Add the new order to Vuex
				debouncedSuccessToast("Order created successfully!");
			} catch (error) {
				const message =
					error.response?.data?.error || "Error creating order.";
				debouncedErrorToast(message); // Debounced error toast
			}
		},
		async fetchOrders({ commit, state }) {
			try {
				const response = await axios.get(
					"http://localhost:5000/api/orders",
					{
						headers: { Authorization: `Bearer ${state.token}` },
					}
				);
				commit("setOrders", response.data);
				debouncedSuccessToast("Orders fetched successfully!");
			} catch (error) {
				const message =
					error.response?.data?.error || "Error fetching orders.";
				debouncedErrorToast(message);
			}
		},
		async fetchTrades({ commit, state }) {
			const trades = detectTrades(state.orders); // Call the trade detection logic
			commit("setTrades", trades); // Store trades in Vuex
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
		getOrders: (state) => state.orders,
		getTrades: (state) => state.trades, // Get the trades from state
	},
});

function detectTrades(orders) {
	// console.log("Orders passed to detectTrades:", orders);

	orders.sort((a, b) => new Date(a.date) - new Date(b.date));

	// console.log("Sorted orders by time:", orders);

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
		const prevPosition = currentPosition.position;

		if (order.side === "buy" || order.side === "BOT") {
			if (currentPosition.position < 0) {
				// Covering a short position
				let quantityToCover = Math.min(
					-currentPosition.position,
					order.quantity
				);
				let remainingQuantity = order.quantity - quantityToCover;

				// Calculate profit/loss for covering shorts
				const profitLoss =
					(currentPosition.avgPrice - order.price) * quantityToCover;

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
				const newTotalQuantity =
					currentPosition.position + order.quantity;
				currentPosition.avgPrice =
					(currentPosition.avgPrice * currentPosition.position +
						order.price * order.quantity) /
					newTotalQuantity;
				currentPosition.position = newTotalQuantity;
			}
		} else if (order.side === "sell" || order.side === "SLD") {
			if (currentPosition.position > 0) {
				// Selling from a long position
				let quantityToSell = Math.min(
					currentPosition.position,
					order.quantity
				);
				let remainingQuantity = order.quantity - quantityToSell;

				// Calculate profit/loss for reducing longs
				const profitLoss =
					(order.price - currentPosition.avgPrice) * quantityToSell;

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
				const newTotalQuantity =
					currentPosition.position - order.quantity;
				currentPosition.avgPrice =
					(Math.abs(
						currentPosition.avgPrice * currentPosition.position
					) +
						order.price * order.quantity) /
					Math.abs(newTotalQuantity);
				currentPosition.position = newTotalQuantity;
			}
		}
	}

	console.log("Final trades array:", trades);

	return {
		trades,
	};
}
