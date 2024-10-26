<template>
	<div style="width: 100%">
		<nav :class="{ collapsed: isCollapsed }" id="sidebar">
			<!-- Toggle Button with Icon -->
			<button @click="toggleSidebar" class="toggle-btn">
				<img :src="toggleIcon" alt="Toggle Sidebar" />
			</button>
			<ul v-if="!isCollapsed">
				<!-- Sidebar links here -->
				<li><router-link to="/">Home</router-link></li>
				<li v-if="!isAuthenticated"><router-link to="/login">Login</router-link></li>
				<li v-if="!isAuthenticated"><router-link to="/register">Register</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/profile">Profile</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/upload-orders">Upload Orders</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/orders">Orders List</router-link></li>
				<li v-if="isAuthenticated"><router-link to="/reports">Reports</router-link></li>
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
import toggleIcon from "@/assets/images/drawer.webp"; // Adjust path as needed

export default {
	data() {
		return {
			isCollapsed: false, // Track sidebar collapsed state
			toggleIcon, // Icon for the toggle button
		};
	},
	computed: {
		...mapGetters(["isAuthenticated", "getUser"]), // Check if user is authenticated and get user details
		isAdmin() {
			// Only admins should see the create broker link
			return this.getUser && this.getUser.role === "admin";
		},
	},
	methods: {
		toggleSidebar() {
			this.isCollapsed = !this.isCollapsed; // Toggle sidebar state
		},
		logout() {
			// Dispatch the logout action and pass the router instance
			this.$store.dispatch("logout", this.$router);
		},
	},
};
</script>

<style>
#sidebar {
	position: fixed;
	top: 0;
	left: 0;
	background-color: #1e3e62;
	padding: 20px;
	height: 100vh;
	width: 20%; /* Sidebar width when expanded */
	overflow-y: auto;
	transition: width 0.3s ease; /* Smooth transition for collapse/expand */
}

#sidebar.collapsed {
	width: 60px; /* Sidebar width when collapsed */
}

#view {
	transition: margin-left 0.3s ease; /* Smooth transition for collapse/expand */
	margin-left: 20%; /* Default margin to leave space for sidebar */
	padding: 20px;
}

#view.collapsed {
	margin-left: 60px; /* Reduced margin when sidebar is collapsed */
}

.toggle-btn {
	background: none;
	border: none;
	color: #ffffff;
	font-size: 18px;
	cursor: pointer;
	margin-bottom: 20px;
	padding: 5px;
}

.toggle-btn img {
	width: 24px; /* Adjust the size of the icon */
	height: 24px;
	transition: transform 0.3s;
}

/* Optional: Rotate icon when sidebar is collapsed */
#sidebar.collapsed .toggle-btn img {
	transform: rotate(180deg);
}

#sidebar ul {
	list-style-type: none;
	padding: 0;
	margin: 0;
}

#sidebar ul li {
	margin-bottom: 10px;
}

#sidebar ul li a {
	color: #eaeaea;
	text-decoration: none;
	padding: 10px;
	display: block;
	border-radius: 4px;
	transition: background-color 0.3s;
}

#sidebar ul li a:hover {
	background-color: #ff6500;
	color: #0b192c;
}

#sidebar ul li a.router-link-exact-active {
	background-color: #ff6500;
	color: #fff;
}

/* Media Queries for Responsive Design */
@media (max-width: 768px) {
	#sidebar {
		width: 100%; /* Full width on smaller screens */
		border-right: none;
		border-bottom: 1px solid #ddd;
	}

	#view {
		width: 100%;
	}
}
</style>
