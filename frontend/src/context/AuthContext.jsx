import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as authApi from "../api/auth.js";

const USER_KEY = "cipher_store_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  const setUserFromData = useCallback((data) => {
    if (data?.data) {
      setUser(data.data);
      localStorage.setItem(USER_KEY, JSON.stringify(data.data));
    } else {
      setUser(null);
      localStorage.removeItem(USER_KEY);
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
    }
  }, []);

  useEffect(() => {
    function onLogout() {
      setUser(null);
      localStorage.removeItem(USER_KEY);
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
