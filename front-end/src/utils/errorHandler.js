/**
 * Centralized API Error Handling
 * 
 * @param {Error} err - The error object caught from try/catch
 * @param {Function} setError - State setter to update UI with friendly message
 * @param {string} endpointInfo - Optional context about the request (e.g., "GET /products")
 */
export const handleApiError = (err, setError, endpointInfo = "API Request") => {
    // 1. Developer Error: Log full technical details to console
    console.error(`[${endpointInfo}] Failed:`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });

    // 2. User Error: Set friendly, actionable message
    let userMessage = "Something went wrong. Please try again.";

    if (err.response) {
        // Server responded with a status code
        const status = err.response.status;

        switch (status) {
            case 400:
                userMessage = err.response.data?.message || "Invalid request. Please check your input.";
                break;
            case 401:
                userMessage = "Session expired. Please log out and sign in again.";
                break;
            case 403:
                userMessage = "Access denied. You do not have permission to view this content.";
                break;
            case 404:
                userMessage = "Requested resource not found. Please contact support.";
                break;
            case 409:
                userMessage = err.response.data?.message || "Conflict error. This item might already exist.";
                break;
            case 422:
                userMessage = err.response.data?.message || "Validation failed. Please check the form.";
                break;
            case 500:
            case 502:
            case 503:
            case 504:
                userMessage = "Server error. We're working on it, please try again later.";
                break;
            default:
                userMessage = err.response.data?.message || `Error (${status}). Please try again.`;
        }
    } else if (err.request) {
        // Request made but no response (Network Error)
        userMessage = "Network error. Please check your internet connection and try again.";
    } else {
        // Something happened in setting up the request
        userMessage = "Application error. Please refresh the page.";
    }

    if (setError) {
        setError(userMessage);
    }

    return userMessage; // Return functionality in case caller wants to use it
};
