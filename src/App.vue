// ./src/App.vue
<template>
    <div style="width: 100%">
        <!-- Top Taskbar -->
        <div id="taskbar">
            <div class="taskbar-left">
                <span class="app-name" v-if="isAuthenticated">Trader Journal</span>
                <router-link to="/login" v-if="!isAuthenticated">Login </router-link>
                <router-link to="/register" v-if="!isAuthenticated" style="font-size: 10px; opacity: 0.6">Register</router-link>
            </div>

            <!-- Centered Gauges -->
            <div class="taskbar-center centered" v-if="isAuthenticated">
                <ReportProfitLossAccuracy :trades="trades" />
            </div>
            <div class="taskbar-right" v-if="isAuthenticated">
                <!-- Date Range Picker -->
                <div class="date-range-picker">
                    <div class="date-input">
                        <label>Start: </label>
                        <input type="date" :value="getStartDate" @input="updateStartDate" />
                    </div>
                    <div class="date-input">
                        <label>End: </label>
                        <input type="date" :value="getEndDate" @input="updateEndDate" />
                    </div>
                </div>
                <div class="dropdown" @click="toggleDropdown">
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
            <router-link v-for="item in dockItems" :key="item.route" :to="item.route" class="dock-icon">
                <img :src="item.icon" :alt="item.label" />
            </router-link>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import uploadIcon from "@/assets/images/upload-icon.png";
import reportsIcon from "@/assets/images/reports-icon.png";
import ReportProfitLossAccuracy from "/src/components/partials/reports/ReportProfitLossAccuracy.vue";

export default {
    components: {
        ReportProfitLossAccuracy,
    },
    data() {
        return {
            uploadIcon,
            reportsIcon,
            showDropdown: false, // Controls the dropdown visibility
            dockItems: [
                { route: "/upload-orders", icon: uploadIcon, label: "Upload Orders" },
                { route: "/reports", icon: reportsIcon, label: "Reports" },
            ],
        };
    },
    computed: {
        ...mapGetters(["isAuthenticated", "getUser", "getStartDate", "getEndDate", "getTrades"]),
        trades() {
            const trades = this.getTrades || [];
            this.hasCorruptData = trades.some((trade) => !trade || !trade.symbol || trade.buyPrice === undefined || isNaN(new Date(trade.date).getTime()));
            return trades;
        },
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
        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.showDropdown = false;
            }
        },
    },
    created() {
        const token = localStorage.getItem("token");

        if (token) {
            // Set the token in the store to ensure Axios requests include it
            this.$store.commit("setToken", token);

            // Fetch user data
            this.$store
                .dispatch("fetchUser")
                .then(() => {
                    console.log("User fetched successfully:", this.$store.getters.getUser);
                })
                .catch((error) => {
                    console.error("Error fetching user:", error);
                    this.$store.commit("clearState"); // Clear state if user fetch fails
                    this.$router.push("/login");
                });
        } else {
            console.log("No token found. Redirecting to login.");
            this.$router.push("/login"); // Redirect to login if no token is found
        }
    },
    mounted() {
        document.addEventListener("click", this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener("click", this.handleClickOutside);
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
    padding-top: 50px; /* Match the taskbar height */
    box-sizing: border-box; /* Ensure padding doesn't affect dimensions */
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
    padding: 0px 20px;
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    z-index: 1000;
    height: 50px;
}

.taskbar-left .app-name {
    font-size: 1.2em;
    font-weight: bold;
    margin-right: 15px;
}

.date-range-picker {
    font-size: 13px;
    margin-right: 10px;
}

.date-input {
    float: left;
    font-size: 13px;
    margin-right: 10px !important;
    font-size: 13px !important;
}
.date-input input {
    font-size: 13px;
    margin-right: 10px !important;
    font-size: 13px !important;
    width: 110px;
    padding: 3px 6px !important;
    border-radius: 1px !important;
    border-style: none !important;
    border: none !important;
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
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 5px;
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
    width: 25px;
    height: 25px;
    padding: 3px;
}
.centered {
    position: absolute; /* Position relative to the closest positioned ancestor */
    top: 50%; /* Move the element's top edge to the middle */
    left: 50%; /* Move the element's left edge to the middle */
    transform: translate(-50%, -50%); /* Shift back by 50% of its width and height */
}
</style>
