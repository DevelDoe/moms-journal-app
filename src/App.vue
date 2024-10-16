<!-- src/App.vue -->
<template>
	<div id="">
		<nav>
			<router-link to="/">Home</router-link>
			<!-- Show not authenticated -->
			<router-link to="/login" v-if="!isAuthenticated">Login</router-link>
			<router-link to="/register" v-if="!isAuthenticated"
				>Register</router-link
			>

			<!-- Show  authenticated -->
			<router-link to="/profile" v-if="isAuthenticated"
				>Profile</router-link
			>
			<router-link to="/new-order" v-if="isAuthenticated"
				>New Order</router-link
			>
			<router-link to="/upload-orders" v-if="isAuthenticated"
				>Upload Orders</router-link
			>
			<router-link to="/orders" v-if="isAuthenticated"
				>Orders List</router-link
			>
			<router-link to="/trades" v-if="isAuthenticated"
				>Trades</router-link
			>
			<router-link to="/WebSocketClient" v-if="isAuthenticated"
				>WebSocketClient</router-link
			>
			<a @click="logout" v-if="isAuthenticated" style="cursor: pointer"
				>Logout</a
			>
		</nav>
		<router-view></router-view>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	computed: {
		...mapGetters(["isAuthenticated"]), // Check if user is authenticated
	},
	methods: {
		logout() {
			// Dispatch the logout action and pass the router instance
			this.$store.dispatch("logout", this.$router);
		},
	},
};
</script>

<style>
body {
	background-color: #fefefe; /* Dark background */
	color: #161616; /* Light text color */
	font-family: "Arial", sans-serif;
	font-size: larger;
	margin: 0;
	padding: 0;
}
nav {
	display: flex;
	gap: 15px;
	margin-bottom: 20px;
}

a {
	text-decoration: none;
}
</style>
