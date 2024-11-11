// utils/auth.js

// Check if the token is expired
export function isTokenExpired(token) {
    try {
        console.log("Checking token expiration");
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode the JWT payload
        const expiration = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        return expiration - now < 5 * 60 * 1000; // Check if expiring within the next 5 minutes
    } catch (error) {
        console.error("Error checking token expiration:", error);
        return true; // Consider it expired if there's any issue decoding it
    }
}

// Check if the user is authenticated (valid token exists in localStorage)
export function isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token && !isTokenExpired(token); // Check if token exists and is not expired
}

// Get the JWT token from localStorage
export function getToken() {
    return localStorage.getItem("token");
}

// Log the user out by removing the token from localStorage
export function logout() {
    localStorage.removeItem("token");
}


