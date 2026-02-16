import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as authApi from "../api/auth.js";
import { setStoredTokens, clearStoredTokens } from "../api/client.js";

const USER_KEY = "cipher_store_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeUserPayload(payload) {
  if (!payload) return null;
  const { accessToken, refreshToken, ...user } = payload;
  if (accessToken || refreshToken) {
    setStoredTokens(accessToken, refreshToken);
  }
  return Object.keys(user).length ? user : null;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  const setUserFromData = useCallback((data) => {
    const payload = data?.data;
    if (payload) {
      const userOnly = normalizeUserPayload(payload);
      setUser(userOnly);
      localStorage.setItem(USER_KEY, JSON.stringify(userOnly));
    } else {
      setUser(null);
      localStorage.removeItem(USER_KEY);
      clearStoredTokens();
    }
  }, []);

  const login = useCallback(async (usernameOrEmail, password) => {
    const isEmail = usernameOrEmail.includes("@");
    const payload = isEmail
      ? { email: usernameOrEmail, password }
      : { username: usernameOrEmail, password };
    const data = await authApi.login(payload);
    setUserFromData(data);
    return data;
  }, [setUserFromData]);

  const register = useCallback(async (fullname, username, email, password) => {
    const data = await authApi.register({ fullname, username, email, password });
    setUserFromData(data);
    return data;
  }, [setUserFromData]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      localStorage.removeItem(USER_KEY);
      clearStoredTokens();
    }
  }, []);

  useEffect(() => {
    function onLogout() {
      setUser(null);
      localStorage.removeItem(USER_KEY);
      clearStoredTokens();
    }
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
