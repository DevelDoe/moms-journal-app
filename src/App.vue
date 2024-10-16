<!-- src/App.vue -->
<template>
	<div>
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

<style >

/* Dark Theme - Global Styles */

body {
  background-color: #1e1e1e; /* Dark background */
  color: #e0e0e0; /* Light text color */
  font-family: 'Arial', sans-serif;
  font-size: larger;
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  color: #ffffff; /* Brighter headings */
  margin: 0 0 20px 0;
}

a {
  color: #1f91ff; /* Bright blue for links */
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Buttons */
button {
  background-color: #3a3a3a;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #5a5a5a;
}

/* Inputs */
input, select, textarea {
  background-color: #2e2e2e;
  border: 1px solid #444444;
  color: #ffffff;
  padding: 10px;
  border-radius: 5px;
}

input::placeholder {
  color: #888888;
}


/* Forms */
form {
  background-color: #292929;
  padding: 20px;
  border-radius: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #cccccc;
}

/* Date Picker */
input[type="date"] {
  background-color: #333333;
  color: #ffffff;
  border: 1px solid #555555;
  padding: 5px 10px;
  border-radius: 5px;
}

/* Code */
pre {
  background-color: #2d2d2d;
  color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

code {
  color: #ffb86c;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: #4e4e4e;
  border-radius: 5px;
}

::-webkit-scrollbar-track {
  background-color: #1e1e1e;
}

/* Footer */
footer {
  background-color: #2e2e2e;
  padding: 10px;
  color: #a1a1a1;
  text-align: center;
  border-top: 1px solid #444444;
}


</style>
