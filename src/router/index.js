// define the routes and configure Vue Router.

// Importing the necessary functions createRouter and createWebHistory from Vue Router,
import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated } from "../utils/auth";

// Importing the components
// Lazy loading in Vue Router can be achieved by dynamically importing components.
// This helps with performance by loading components only when they are needed, rather than loading everything upfront.
const Home = () => import("../components/Home.vue");
const Login = () => import("../components/Login.vue");
const Register = () => import("../components/Register.vue");
const Profile = () => import("../components/Profile.vue");
const NewOrder = () => import("../components/NewOrder.vue");
const OrdersList = () => import("../components/OrdersList.vue");
const UploadOrders = () => import("../components/UploadOrders.vue");
const Reports = () => import("../components/Reports.vue");

// Defining Routes: The routes array defines the paths and components that Vue Router will handle:
const routes = [
	{ path: "/", component: Home },
	{ path: "/login", component: Login },
	{ path: "/register", component: Register },
	{ path: "/profile", component: Profile, meta: { requiresAuth: true } },
	{ path: "/new-order", component: NewOrder, meta: { requiresAuth: true } },
	{ path: "/orders", component: OrdersList, meta: { requiresAuth: true } },
	{ path: "/upload-orders", component: UploadOrders, meta: { requiresAuth: true } },
	{ path: "/Reports", component: Reports, meta: { requiresAuth: true } },
];

// The createRouter function initializes the router with the history mode,
// meaning it uses the browser’s history.pushState to navigate,
// so the URLs look clean (without hash fragments #).
const router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach((to, from, next) => {
	// Only log in development mode
	if (process.env.NODE_ENV === "development") {
		console.log("Navigating to:", to.fullPath); // Log the route trying to be accessed
		console.log("Requires Auth?", to.meta.requiresAuth); // Log if the route requires authentication
		console.log("Is user authenticated?", isAuthenticated()); // Check if the user is authenticated
	}

	if (to.meta.requiresAuth && !isAuthenticated()) {
		// Redirect unauthenticated users
		if (process.env.NODE_ENV === "development") {
			console.log("Redirecting unauthenticated user to home page.");
		}
		next({
			path: "/",
			query: { redirect: to.fullPath }, // Save the route they tried to access
		});
	} else {
		if (process.env.NODE_ENV === "development") {
			console.log("User is allowed to access the route.");
		}
		next(); // Allow the navigation
	}
});

// export the router instance so it can be used in the main Vue instance.
export default router;
