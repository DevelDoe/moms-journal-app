// utils/auth.js


let lastChecked = null;
let lastResult = null;

export function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Date.now() / 1000; // Current time in seconds
        const isExpired = now >= payload.exp;
        console.log(`Token expiration check: exp=${payload.exp}, now=${now}, isExpired=${isExpired}`);
        return isExpired;
    } catch (err) {
        console.error("Error decoding token:", err);
        return true; // Treat invalid tokens as expired
    }
}




// Check if the user is authenticated (valid token exists in localStorage)
export function isAuthenticated() {
    const token = getToken();
    const valid = !!token && !isTokenExpired(token);
    console.log(`Authentication check: tokenExists=${!!token}, isValid=${valid}`);
    return valid;
}

// Get the JWT token from localStorage
export function getToken() {
    return localStorage.getItem("token");
}

// Log the user out by removing the token from localStorage
export function logout() {
    localStorage.removeItem("token");
}


