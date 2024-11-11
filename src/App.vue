// ./src/App.vue
<template>
    <div style="width: 100%">
        <!-- Top Taskbar -->
        <div id="taskbar">
            <div class="taskbar-left">
                <span class="app-name">Mom's Journal</span>
                <router-link to="/login">Login</router-link>
                <router-link to="/register">Register</router-link>
            </div>
            <div class="taskbar-right">
                <!-- Date Range Picker -->
                <div class="date-range-picker">
                    <div class="date-input">
                        <label>Start Date:</label>
                        <input type="date" :value="getStartDate" @input="updateStartDate" />
                    </div>
                    <div class="date-input">
                        <label>End Date:</label>
                        <input type="date" :value="getEndDate" @input="updateEndDate" />
                    </div>
                </div>
                <div v-if="isAuthenticated" class="dropdown" @click="toggleDropdown">
                    <span class="username">{{ getUser?.name || "User" }}</span>
                    <div v-if="showDropdown" class="dropdown-content">
                        <router-link to="/profile">Profile</router-link>
                        <a @click="handleLogout">Logout</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main content view -->
        <div id="view">
            <router-view></router-view>
        </div>

        <!-- Dock at the bottom -->
        <div class="dock">
            <router-link v-if="isAuthenticated" to="/upload-orders" class="dock-icon">
                <img :src="uploadIcon" alt="Upload Orders" />
            </router-link>
            <router-link v-if="isAuthenticated" to="/reports" class="dock-icon">
                <img :src="reportsIcon" alt="Reports" />
            </router-link>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import uploadIcon from "@/assets/images/upload-icon.png";
import reportsIcon from "@/assets/images/reports-icon.png";

export default {
    data() {
        return {
            uploadIcon,
            reportsIcon,
            showDropdown: false, // Controls the dropdown visibility
        };
    },
    computed: {
        ...mapGetters(["isAuthenticated", "getUser", "getStartDate", "getEndDate"]),
    },
    methods: {
        ...mapActions(["updateDateRange", "logout"]), // Map updateDateRange and logout actions
        async handleLogout() {
            // Call the Vuex action `logout` and pass the router instance
            await this.logout(this.$router);
        },
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        updateStartDate(event) {
            const newStartDate = event.target.value;
            this.updateDateRange({ start: newStartDate, end: this.getEndDate });
        },
        updateEndDate(event) {
            const newEndDate = event.target.value;
            this.updateDateRange({ start: this.getStartDate, end: newEndDate });
        },
    },
};
</script>

<style>
/* existing styles */
</style>

<style>
.app-name {
    color: #0b192c;
}
#view {
    padding-top: 40px;
}
/* Taskbar styling */
#taskbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.taskbar-left .app-name {
    font-size: 1.2em;
    font-weight: bold;
    margin-right: 15px;
}

.taskbar-right {
    display: flex;
    align-items: center;
    color: #0b192c;
}

/* Dropdown styling */
.dropdown {
    position: relative;
    cursor: pointer;
}

.dropdown-content {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 5px;
    padding: 10px;
    background-color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    z-index: 1;
}

.dropdown-content a,
.dropdown-content .router-link {
    padding: 8px 12px;
    text-decoration: none;
    color: black;
    transition: background-color 0.2s;
}

.dropdown-content a:hover,
.dropdown-content .router-link:hover {
    background-color: #f0f0f0;
}

.dock {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.01);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    /* box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); */
    z-index: 1000;
}

.dock-icon {
    margin: 0 10px;
    transition: transform 0.3s;
}

.dock-icon:hover {
    transform: scale(1.3);
}
.dock-icon img {
    width: 80px; /* Adjust this value to make the icons smaller */
    height: 80px; /* Keep the same height as width for a square ratio */
    padding: 20px;
}
</style>
