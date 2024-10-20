// utils/auth.js
// Check if the user is authenticated (valid token exists in localStorage)
export function isAuthenticated() {
	const token = localStorage.getItem("token");
	return !!token; // Return true if token exists
}
// Get the JWT token from localStorage
export function getToken() {
	return localStorage.getItem("token");
}
// Log the user out by removing the token from localStorage
export function logout() {
	localStorage.removeItem("token");
}
