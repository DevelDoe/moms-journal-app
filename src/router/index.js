// define the routes and configure Vue Router.

// Importing the necessary functions createRouter and createWebHistory from Vue Router,
import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated } from "../utils/auth";

// Importing the views
// Lazy loading in Vue Router can be achieved by dynamically importing components.
// This helps with performance by loading components only when they are needed, rather than loading everything upfront.
const Home = () => import("../views/Home.vue");
const Login = () => import("../views/Login.vue");
const Register = () => import("../views/Register.vue");
const Profile = () => import("../views/Profile.vue");
const About = () => import("../views/About.vue");
const NewOrder = () => import("../views/NewOrder.vue");
const OrdersList = () => import("../views/OrdersList.vue");
const UploadOrders = () => import("../views/UploadOrders.vue");
const Trades = () => import("../views/Trades.vue");

// Defining Routes: The routes array defines the paths and components that Vue Router will handle:
const routes = [
	{ path: "/", component: Home },
	{ path: "/login", component: Login },
	{ path: "/register", component: Register },
	{ path: "/about", component: About },
	{ path: "/profile", component: Profile, meta: { requiresAuth: true } },
	{ path: "/new-order", component: NewOrder, meta: { requiresAuth: true } },
	{ path: "/orders", component: OrdersList, meta: { requiresAuth: true } },
	{ path: "/upload-orders", component: UploadOrders, meta: { requiresAuth: true } }, 
	{ path: "/Trades", component: Trades, meta: { requiresAuth: true } }, 
];

// The createRouter function initializes the router with the history mode,
// meaning it uses the browser’s history.pushState to navigate,
// so the URLs look clean (without hash fragments #).
const router = createRouter({
	history: createWebHistory(),
	routes,
});

// Route guard for protected routes
router.beforeEach((to, from, next) => {
	if (to.meta.requiresAuth && !isAuthenticated()) {
	  next({
		path: '/',
		query: { redirect: to.fullPath } // Pass the route they tried to access
	  });
	} else {
	  next();
	}
  });

// export the router instance so it can be used in the main Vue instance.
export default router;
