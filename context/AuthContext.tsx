import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { api } from "@/services/api";
import { getItem, setItem, deleteItem } from "@/services/secureStore";
import { jwtDecode } from "jwt-decode";
import { LoginRequest, LoginResponse } from "@/types/auth";
import { RegisterRequest, RegisterResponse } from "@/types/auth";
import { registerPushToken } from "@/services/notifications";

type DecodedToken = {
  id?: string;
  email?: string;
  name?: string;
  exp?: number;
  role?: string | string[];
};

type AuthState = {
  token: string | null;
  user: { id?: string; email?: string; name?: string; roles?: string[];} | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Load tokens on startup
  useEffect(() => {
    (async () => {
      const t = await getItem("accessToken");
      if (t) {
        setToken(t);
        try {
          const decoded = jwtDecode<DecodedToken>(t);
          if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
            console.warn("Access token expired, will refresh soon...");
          } else {
            setUser({
              id: decoded.id,
              email: decoded.email,
              name: decoded.name ?? decoded.email,
              roles: decoded.role
              ? Array.isArray(decoded.role)
                ? decoded.role
                : [decoded.role]          // force into array
              : []
            });
          }
        } catch (err) {
          console.warn("Token decode failed:", err);
        }
      }
      setLoading(false);
    })();
  }, []);

  // 🔹 Login
  const login = async (email: string, password: string) => {    
      const payload: LoginRequest = { email, password };
      const res = await api.post<LoginResponse>("/auth/login", payload);
      const { token: accessToken, refreshToken } = res.data;
      if (!accessToken) throw new Error("No token returned");      

      await setItem("accessToken", accessToken);
      await setItem("refreshToken", refreshToken);
      setToken(accessToken);
      
      const decoded = jwtDecode<DecodedToken>(accessToken);
      setUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name ?? decoded.email,
        roles: decoded.role
        ? Array.isArray(decoded.role)
          ? decoded.role
          : [decoded.role]          // force into array
        : []
      });

      router.replace("/(tabs)");

      //await registerPushToken();
      registerPushToken().catch(err => {
        console.log("Push token registration failed (ignored):", err?.message);
      });      
  };

  // // 🔹 Logout
  // const logout = async () => {
  //   await deleteItem("accessToken");
  //   await deleteItem("refreshToken");
  //   setToken(null);
  //   setUser(null);
  //   router.replace("/login");
  // };

  const logout = async () => {
    try {
      await deleteItem("accessToken");
      await deleteItem("refreshToken");
    } finally {
      setToken(null);
      setUser(null);
      router.replace("/login"); // adjust if needed
    }
  };

  // 🆕 🔹 Register (final production version)
  const register = async (fullName: string, email: string, password: string) => {
   
      // 1️⃣ Strongly-typed payload
      const payload: RegisterRequest = { fullName, email, password };

      // 2️⃣ Call backend and infer response via generic type
      const res = await api.post<RegisterResponse>("/auth/register", payload);
      const { token: accessToken, refreshToken } = res.data;
      if (!accessToken) throw new Error("No token returned");

      // 3️⃣ Store securely (reuse your same helper as login) and Update in-memory token 
      await setItem("accessToken", accessToken);
      await setItem("refreshToken", refreshToken);
      setToken(accessToken);

      // 4️⃣ Decode JWT to populate user state
      const decoded = jwtDecode<DecodedToken>(accessToken);
      setUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name ?? decoded.email,
        roles: decoded.role
        ? Array.isArray(decoded.role)
          ? decoded.role
          : [decoded.role]          // force into array
        : []
      });

      // 5️⃣ navigate    
      router.replace("/(tabs)");
  };

  // 🆕 🔹 Forgot Password
  const requestPasswordReset = async (email: string) => {
    try {
      await api.post("/auth/forgot-password", { email });
    } catch (err: any) {
      console.error("Forgot password failed:", err?.response?.data ?? err.message);
      alert(err?.response?.data?.message ?? "Failed to send reset link.");
    }
  };

  // 🆕 🔹 Reset Password
  const resetPassword = async (email: string, token: string, newPassword: string) => {
    try {

       const canSubmit1 = /\S+@\S+\.\S+/.test(email);
       const canSubmit2 = newPassword.length >= 6;

       if (!canSubmit1) {
          return alert("Enter a valid email.");
        }

        if (!canSubmit2) {
          return alert("Password must be at least 6 characters.");
        }

        if (!email || !token || !newPassword) {
          return alert("All fields are required.");
        }
        
      await api.post("/auth/reset-password", { email, token, newPassword });
      alert("Password reset successful! You can now login.");
      router.replace("/login");
    } catch (err: any) {
      console.error("Reset password failed:", err?.response?.data ?? err.message);
      alert(err?.response?.data?.message ?? "Failed to reset password.");
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      register,
      requestPasswordReset,
      resetPassword,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

