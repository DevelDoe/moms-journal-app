// utils/auth.js

// utils/auth.js

let lastChecked = null;
let lastResult = null;

export function isTokenExpired(token) {
    const now = Date.now();
    if (lastChecked && now - lastChecked < 5000) { // Cache result for 5 seconds
        return lastResult;
    }
    lastChecked = now;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        lastResult = Date.now() >= payload.exp * 1000;
        return lastResult;
    } catch (err) {
        console.error("Error decoding token:", err);
        return true; // Consider token expired if it can't be parsed
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


