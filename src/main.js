import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store'; // Import the Vuex store

const app = createApp(App);
app.use(router); // Register router
app.use(store);  // Register the Vuex store
app.mount('#app');