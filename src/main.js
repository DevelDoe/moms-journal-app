import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store"; // Import the Vuex store
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Load the auth token from localStorage before mounting the app
const token = localStorage.getItem("token");
if (token) {
	store.commit("setToken", token); // Set the auth token in Vuex store if it exists
	store.dispatch('fetchUser');
}

const toastOptions = {
	position: "bottom-right",
	timeout: 4000,
	closeOnClick: true,
	pauseOnHover: true,
};

const app = createApp(App);
app.use(router); // Register router
app.use(store); // Register Vuex store
app.use(Toast, toastOptions); // Register toast
app.mount("#app");
