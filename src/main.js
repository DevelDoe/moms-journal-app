import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store"; // Import the Vuex store
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";


import VChart from 'vue-echarts';  // Import VChart
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';

// Register necessary ECharts components
use([CanvasRenderer, BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent]);

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
app.component('v-chart', VChart);

app.mount("#app");
