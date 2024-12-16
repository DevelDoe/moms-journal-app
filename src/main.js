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

let isRefreshing = false; // To track ongoing token refresh
let refreshSubscribers = []; // Queue to resolve pending requests after refresh

// Notify all subscribers with the new token
const notifySubscribers = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
};

// Axios request interceptor to handle token refresh
axios.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("token");

        if (token && isTokenExpired(token)) {
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const refreshed = await store.dispatch("refreshToken");
                    if (refreshed) {
                        const newToken = localStorage.getItem("token");
                        notifySubscribers(newToken);
                    } else {
                        store.commit("clearState");
                        router.push("/login");
                    }
                } catch (error) {
                    console.error("Error refreshing token:", error);
                    store.commit("clearState");
                    router.push("/login");
                } finally {
                    isRefreshing = false;
                }
            }

            // Queue pending requests while refreshing the token
            return new Promise((resolve) => {
                refreshSubscribers.push((newToken) => {
                    config.headers["Authorization"] = `Bearer ${newToken}`;
                    resolve(config);
                });
            });
        }

        // If no refresh needed, proceed with the request
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
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
