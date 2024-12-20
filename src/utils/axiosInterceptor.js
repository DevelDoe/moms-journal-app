import axios from "axios";
import store from "../store";
import router from "../router";
import { isTokenExpired } from "./auth";

let isRefreshing = false;
let refreshSubscribers = [];

const notifySubscribers = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
};

const setupAxiosInterceptor = () => {
    let retryCount = 0;
    const MAX_RETRY = 1;

    axios.interceptors.request.use(
        async (config) => {
            const token = store.state.token || localStorage.getItem("token");

            if (token && isTokenExpired(token)) {
                if (retryCount >= MAX_RETRY) {
                    console.error("Max retry attempts reached.");
                    throw new Error("Session expired.");
                }

                retryCount++;
                console.log("Token expired. Dispatching refreshToken...");
                const refreshed = await store.dispatch("refreshToken");
                if (!refreshed) {
                    retryCount = 0; // Reset retry count
                    throw new Error("Failed to refresh token.");
                }
                retryCount = 0; // Reset retry count
            }

            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};

export default setupAxiosInterceptor;
