// src/store/index.js
import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state: {
    user: null,      // Store the user object
    token: localStorage.getItem('token') || '',  // Store the token for authentication
    orders: [],      // Store the list of orders
  },
  mutations: {
    // Set the authenticated user
    setUser(state, user) {
      state.user = user;
    },
    // Set or remove the authentication token
    setToken(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    // Set the orders in the state
    setOrders(state, orders) {
      state.orders = orders;
    },
    // Add a new order to the list of orders
    addOrder(state, order) {
      state.orders.push(order);
    },
    // Clear user and orders (for logout)
    clearState(state) {
      state.user = null;
      state.token = '';
      state.orders = [];
      localStorage.removeItem('token');
    },
  },
  actions: {
    // Login action to authenticate and store the user and token
    async loginAction({ commit }, { email, password }) {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password,
        });
        const { token, user } = response.data;
        commit('setUser', user);  // Save the user
        commit('setToken', token); // Save the token
        return true; // Successful login
      } catch (error) {
        console.error('Login failed:', error.response.data);
        return false;
      }
    },
    // Fetch user orders from the backend and store them in the state
    async fetchOrders({ commit, state }) {
      try {
        const response = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${state.token}` },
        });
        commit('setOrders', response.data); // Store orders in the Vuex state
      } catch (error) {
        console.error('Error fetching orders:', error.response.data);
      }
    },
    // Add a new order to the backend and store it in the Vuex state
    async createOrder({ commit, state }, orderData) {
      try {
        const response = await axios.post('http://localhost:5000/api/orders', orderData, {
          headers: { Authorization: `Bearer ${state.token}` },
        });
        commit('addOrder', response.data); // Add the new order to Vuex
      } catch (error) {
        console.error('Error creating order:', error.response.data);
      }
    },
    // Logout action to clear the state
    logout({ commit }) {
      commit('clearState');
    },
  },
  getters: {
    // Return the authenticated user
    isAuthenticated: (state) => !!state.token,
    // Get the user data
    getUser: (state) => state.user,
    // Get the list of orders
    getOrders: (state) => state.orders,
  },
});
