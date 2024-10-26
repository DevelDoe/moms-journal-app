<template>
	<div style="width: 100%">
		<nav id="sidebar">
			<ul>
				<!-- General links -->
				<li><router-link to="/">Home</router-link></li>

				<!-- Not authenticated -->
				<li v-if="!isAuthenticated"><router-link to="/login">Login</router-link></li>
				<li v-if="!isAuthenticated"><router-link to="/register">Register</router-link></li>

				<!-- Authenticated users -->
				<li v-if="isAuthenticated"><router-link to="/profile">Profile</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/upload-orders">Upload Orders</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/orders">Orders List</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/Reports">Reports</router-link></li>

				<!-- Admin only -->

				<!-- Logout -->
				<li v-if="isAuthenticated"><a @click="logout" style="cursor: pointer">Logout</a></li>
			</ul>
		</nav>
		<div id="view">
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	computed: {
		...mapGetters(["isAuthenticated", "getUser"]), // Check if user is authenticated and get user details
		isAdmin() {
			// Only admins should see the create broker link
			return this.getUser && this.getUser.role === "admin";
		},
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
* {
	box-sizing: border-box; /* Apply border-box globally */
}

#app {
	display: flex;
	min-height: 100vh;
}

#sidebar {
	width: 20%; /* Sidebar takes 20% of the total width */
	background-color: #f4f4f4;
	padding: 20px;
	border-right: 1px solid #ddd;
	height: 100%; /* Full height sidebar */
	float: left;
}

#view {
	width: 80%;
	padding: 20px;
	float: right;
}

nav ul {
	list-style-type: none;
	padding: 0;
	margin: 0;
}

nav ul li {
	margin-bottom: 10px;
}

nav ul li a {
	color: #333;
	text-decoration: none;
	padding: 10px;
	display: block;
	border-radius: 4px;
	transition: background-color 0.3s;
}

nav ul li a:hover {
	background-color: #ddd;
}

nav ul li a.router-link-exact-active {
	background-color: #bbb;
	color: #fff;
}

/* Media Queries for Responsive Design */
@media (max-width: 768px) {
	#app {
		flex-direction: column; /* Stack sidebar and main content vertically on smaller screens */
	}

	#sidebar {
		width: 100%; /* Sidebar takes full width on smaller screens */
		border-right: none;
		border-bottom: 1px solid #ddd;
	}

	#view {
		width: 100%; /* Content area takes full width on smaller screens */
	}
}
</style>
