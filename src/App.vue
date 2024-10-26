<template>
	<div style="width: 100%">
		<nav :class="{ collapsed: isCollapsed }" id="sidebar">
			<button @click="toggleSidebar" class="toggle-btn">
				{{ isCollapsed ? '➡️' : '⬅️' }}
			</button>
			<ul v-if="!isCollapsed">
				<!-- Sidebar links -->
				<li><router-link to="/">Home</router-link></li>
				<li v-if="!isAuthenticated"><router-link to="/login">Login</router-link></li>
				<li v-if="!isAuthenticated"><router-link to="/register">Register</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/profile">Profile</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/upload-orders">Upload Orders</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/orders">Orders List</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/Reports">Reports</router-link></li>
				<li v-if="isAuthenticated"><a @click="logout" style="cursor: pointer">Logout</a></li>
			</ul>
		</nav>
		<div :class="{ collapsed: isCollapsed }" id="view">
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	data() {
		return {
			isCollapsed: false, // Track sidebar collapsed state
		};
	},
	computed: {
		...mapGetters(["isAuthenticated", "getUser"]),
		isAdmin() {
			return this.getUser && this.getUser.role === "admin";
		},
	},
	methods: {
		toggleSidebar() {
			this.isCollapsed = !this.isCollapsed; // Toggle sidebar state
		},
		logout() {
			this.$store.dispatch("logout", this.$router);
		},
	},
};
</script>

<style>
#sidebar {
    position: fixed; /* Fix the sidebar in place */
    top: 0;
    left: 0;
    width: 20%; /* Sidebar takes 20% of the total width */
    background-color: #1E3E62;
    padding: 20px;
    height: 100vh; /* Full viewport height */
    overflow-y: auto; /* Adds scrollbar if content overflows */
}

#view {
    margin-left: 20%; /* Offset the main view to the right of the sidebar */
    padding: 20px;
    width: 80%;
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
	color: #EAEAEA;
	text-decoration: none;
	padding: 10px;
	display: block;
	border-radius: 4px;
	transition: background-color 0.3s;
}

nav ul li a:hover {
	background-color: #FF6500;
	color: #0b192c;
}

nav ul li a.router-link-exact-active {
	background-color: #FF6500;
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
