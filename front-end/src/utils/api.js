import axios from "axios";

// Create a custom axios instance with interceptors
const api = axios.create({
    baseURL: "http://glamora.up.railway.app",
});

// Request interceptor - automatically attach token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401/403 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;

            // Token expired or unauthorized
            if (status === 401 || status === 403) {
                // Clear tokens
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");

                // Store session expired message for login page to display
                sessionStorage.setItem("sessionExpired", "true");

                // Redirect to login page
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
