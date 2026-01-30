import axios, { AxiosError } from "axios";
import { getItem, setItem, deleteItem } from "@/services/secureStore";
import { RefreshResponse } from "@/types/auth";
import Constants from "expo-constants";

// const API_BASE_URL =
//   process.env.EXPO_PUBLIC_API_URL ??
//   "https://flowosapi-f5gxcvgkenfpezaa.canadacentral-01.azurewebsites.net/api";

// const API_BASE_URL =
//   process.env.EXPO_PUBLIC_API_URL ??
//   "http://10.221.248.65:44347/api";
//   //"https://10.138.107.236:44348/api";

const API_BASE_URL =
  (Constants.expoConfig?.extra?.API_URL as string) ??
  "https://flowos-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Track if refresh is already in progress (avoid race conditions)
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

// 🧠 Attach access token before every request
api.interceptors.request.use(async (config) => {
  const token = await getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🔑 [REQUEST] Added token to ${config.url}`);
  } else {
    console.log(`⚠️ [REQUEST] No access token for ${config.url}`);
  }
  return config;
});

// 🚀 Handle expired tokens automatically
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response) {
      console.log(
        `❌ [RESPONSE] ${error.response.status} ${originalRequest?.url}`
      );
    } else {
      console.log("❌ [RESPONSE] Network or CORS error:", error.message);
    }

    // If token expired (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        console.log("⏳ [REFRESH] Another refresh in progress, queuing request…");
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log("🔁 [RETRY] Retrying queued request after refresh");
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("♻️ [REFRESH] Token expired — requesting new access token…");
        const refreshToken = await getItem("refreshToken");
        if (!refreshToken) {
          console.warn(
            "⚠️ [REFRESH] No refresh token available (user probably not logged in)"
          );
          return Promise.reject(error);
        }

        const res = await axios.post<RefreshResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { token: newAccessToken, refreshToken: newRefreshToken } = res.data;

        console.log("✅ [REFRESH] Token refreshed successfully");
        await setItem("accessToken", newAccessToken);
        await setItem("refreshToken", newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = "Bearer " + newAccessToken;
        console.log("🔁 [RETRY] Retrying original request with new token");
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ [REFRESH] Token refresh failed:", refreshError);
        processQueue(refreshError, null);

        await deleteItem("accessToken");
        await deleteItem("refreshToken");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Other errors
    return Promise.reject(error);
  }
);

//
// 🆕 Optional helper functions for Auth-related API calls
//
export const authApi = {
  register(fullName: string, email: string, password: string) {
    return api.post("/auth/register", { fullName, email, password });
  },
  forgot(email: string) {
    return api.post("/auth/forgot-password", { email });
  },
  reset(email: string, token: string, newPassword: string) {
    return api.post("/auth/reset-password", { email, token, newPassword });
  },
};

export { api };

