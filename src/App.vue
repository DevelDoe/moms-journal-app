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
import toggleIcon from "@/assets/images/drawer.webp"; // Adjust path as needed

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

.toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    margin-bottom: 20px;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-btn img {
    width: 24px; /* Adjust size */
    height: 24px;
    transition: transform 0.3s;
}

/* Optional rotation for open/close */
#sidebar.collapsed .toggle-btn img {
    transform: rotate(180deg); /* Rotates icon when collapsed */
}

#view {
    margin-left: 20%; /* Default width for expanded sidebar */
    transition: margin-left 0.3s;
    padding: 20px;
}

#view.collapsed {
    margin-left: 60px; /* Shift content to the left when sidebar is collapsed */
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
