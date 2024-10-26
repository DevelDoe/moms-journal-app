<template>
	<div style="width: 100%">
		<nav :class="{ collapsed: isCollapsed }" id="sidebar">
			<!-- Toggle Button with Icon -->
			<button @click="toggleSidebar" class="toggle-btn">
				<img :src="toggleIcon" alt="Toggle Sidebar" />
			</button>
			<ul v-if="!isCollapsed">
				<!-- Sidebar links here -->
			</ul>
		</nav>
		<div :class="{ collapsed: isCollapsed }" id="view">
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
import toggleIcon from "/assets/images/drawer.webp"; // Adjust path as needed

export default {
	data() {
		return {
			isCollapsed: false, // Track sidebar collapsed state
			toggleIcon, // Icon for the toggle button
		};
	},
	methods: {
		toggleSidebar() {
			this.isCollapsed = !this.isCollapsed; // Toggle sidebar state
		},
	},
};
</script>


<style>
#sidebar {
    position: fixed;
    top: 0;
    left: 0;
    background-color: #1E3E62;
    padding: 20px;
    height: 100vh;
    overflow-y: auto;
    transition: width 0.3s;
}

#sidebar.collapsed {
    width: 60px; /* Narrow width when collapsed */
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
    color: #EAEAEA;
    text-decoration: none;
    padding: 10px;
    display: block;
    border-radius: 4px;
    transition: background-color 0.3s;
}

#sidebar ul li a:hover {
    background-color: #FF6500;
    color: #0b192c;
}

#view {
    transition: margin-left 0.3s;
    margin-left: 20%; /* Default width for expanded sidebar */
    padding: 20px;
}

#view.collapsed {
    margin-left: 60px; /* Shift content to the left when sidebar is collapsed */
}

/* Toggle button styles */
.toggle-btn {
    background: none;
    border: none;
    color: #ffffff;
    font-size: 18px;
    cursor: pointer;
    margin-bottom: 20px;
    padding: 5px;
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
