import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // 1. Check if the error is 401
    if (err.response?.status === 401) {
      
      // 🛑 STOP THE LOOP: If the failed request was the refresh-token itself, 
      // or if we've already retried once, bail out immediately.
      if (original.url.includes("/refresh-token") || original._retry) {
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(err); 
      }

      original._retry = true;

      try {
        // 2. Attempt to refresh tokens
        await api.post("/v1/users/refresh-token");
        
        // 3. Retry the original request with the new cookie
        return api(original);
      } catch (refreshErr) {
        // 4. Refresh failed (expired/no cookie) - Force Logout
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshErr); // Must reject to stop the chain
      }
    }

    return Promise.reject(err);
  },
);

export default api;
