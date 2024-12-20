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
import { isTokenExpired } from "./utils/auth";
import setupAxiosInterceptor from "./utils/axiosInterceptor";

// Set up Axios interceptor
setupAxiosInterceptor();

// Register necessary ECharts components
use([CanvasRenderer, BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent]);

// Toast options
const toastOptions = {
    position: "bottom-right",
    timeout: 4000,
    closeOnClick: true,
    pauseOnHover: true,
    toastClassName: "my-toast",
};

// Set global Axios base URL
axios.defaults.baseURL = "http://localhost:5000/api";

// Load token and handle app initialization
const token = localStorage.getItem("token");
if (token) {
    console.log("Token found:", token);

    if (!isTokenExpired(token)) {
        store.commit("setToken", token);

        store.dispatch("fetchUser").catch(() => {
            console.error("Failed to fetch user");
            store.commit("clearState");
            router.push("/login");
            Toast.error("Session expired. Please log in again.");
        });
    } else {
        console.log("Token expired, attempting to refresh...");
        store.dispatch("refreshToken").then((refreshed) => {
            if (refreshed) {
                store.dispatch("fetchUser").catch(() => {
                    console.error("Failed to fetch user");
                    store.commit("clearState");
                    router.push("/login");
                    Toast.error("Session expired. Please log in again.");
                });
            } else {
                store.commit("clearState");
                router.push("/login");
                Toast.error("Session expired. Please log in again.");
            }
        }).catch(() => {
            store.commit("clearState");
            router.push("/login");
            Toast.error("Session expired. Please log in again.");
        });
    }
}

const app = createApp(App);

app.use(router);
app.use(store);
app.use(Toast, toastOptions);
app.component("v-chart", VChart);

app.mount("#app");
