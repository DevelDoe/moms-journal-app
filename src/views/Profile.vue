<!-- src/views/Profile.vue -->
<template>
	<div v-if="user">
		<h2>User Profile</h2>
		<p><strong>Name:</strong> {{ user.name }}</p>
		<p><strong>Email:</strong> {{ user.email }}</p>
		<h3>Your Orders</h3>
		<ul>
			<li v-for="order in orders" :key="order._id">
				{{ order.symbol }} - {{ order.side }} {{ order.quantity }} @ ${{
					order.price
				}}
			</li>
		</ul>
		<button @click="logout">Logout</button>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	computed: {
		...mapGetters(["getUser", "getOrders"]), // Get user and orders from Vuex
		user() {
			return this.getUser;
		},
		orders() {
			return this.getOrders;
		},
	},
	watch: {
		// Watch the user object for changes. If it becomes null, redirect to home.
		user(newUser) {
			if (!newUser) {
				this.$router.push("/"); // Redirect to the home page when user is null
			}
		},
	},
	created() {
		if (this.user) {
			this.fetchOrders(); // Fetch orders if the user is logged in
		} else {
			this.$router.push("/"); // Redirect if no user when page is created
		}
	},
	methods: {
		...mapActions(["fetchOrders", "logout"]),
	},
};
</script>
