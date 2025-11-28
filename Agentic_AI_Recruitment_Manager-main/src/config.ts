// API Configuration
// In production, this should be set to the backend URL (e.g., https://your-backend.onrender.com)
// In local development, it can be empty to use the Vite proxy, or set to http://localhost:5000

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (endpoint: string) => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // If API_BASE_URL is empty, return relative path (uses proxy in dev)
    if (!API_BASE_URL) {
        return `/${cleanEndpoint}`;
    }

    // Otherwise combine base URL and endpoint
    return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default API_BASE_URL;
