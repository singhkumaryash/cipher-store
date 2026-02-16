import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const TOKEN_ACCESS = "cipher_store_access_token";
const TOKEN_REFRESH = "cipher_store_refresh_token";

export function getStoredAccessToken() {
  return localStorage.getItem(TOKEN_ACCESS);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(TOKEN_REFRESH);
}

export function setStoredTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(TOKEN_ACCESS, accessToken);
  if (refreshToken) localStorage.setItem(TOKEN_REFRESH, refreshToken);
}

export function clearStoredTokens() {
  localStorage.removeItem(TOKEN_ACCESS);
  localStorage.removeItem(TOKEN_REFRESH);
}

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Send stored access token so auth works when deployed (cross-origin cookies may not be sent)
api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401) {
      if (original.url?.includes("/refresh-token") || original._retry) {
        clearStoredTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(err);
      }

      original._retry = true;
      const refreshToken = getStoredRefreshToken();

      try {
        // Prefer sending refresh token in body for cross-origin (cookies may not be sent)
        const refreshRes = await api.post("/v1/users/refresh-token", {
          refreshToken: refreshToken || undefined,
        });
        const payload = refreshRes.data?.data;
        if (payload?.accessToken) {
          setStoredTokens(payload.accessToken, payload.refreshToken);
        }
        return api(original);
      } catch (refreshErr) {
        clearStoredTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  },
);

export default api;
