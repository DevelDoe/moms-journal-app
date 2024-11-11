// ./src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import { isTokenExpired } from "./utils/auth"; // Make sure this is correctly imported

// Register necessary ECharts components
use([CanvasRenderer, BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent]);

// Toast options for notifications
const toastOptions = {
    position: "bottom-right",
    timeout: 4000,
    closeOnClick: true,
    pauseOnHover: true,
    toastClassName: "my-toast",
};

// Set global Axios configuration for base URL
axios.defaults.baseURL = "http://localhost:5000/api";

// Axios request interceptor to handle token refresh
axios.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("token");
        
        if (token && isTokenExpired(token)) {
            // If the token is expired or expiring soon, attempt to refresh
            const refreshed = await store.dispatch("refreshToken");
            if (refreshed) {
                config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`; // Update token in headers
            } else {
                store.commit("clearState"); // Clear store if refresh fails
                router.push("/login"); // Redirect to login
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Load the auth token from localStorage before mounting the app
const token = localStorage.getItem("token");
if (token) {
    store.commit("setToken", token); // Set the auth token in Vuex store if it exists
    store.dispatch("fetchUser");
}

const app = createApp(App);

app.use(router); // Register router
app.use(store); // Register Vuex store
app.use(Toast, toastOptions); // Register toast
app.component("v-chart", VChart);

app.mount("#app");
