import axios, { InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: auto-inject token dari Next-Auth
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get session dari Next-Auth
    const session = await getSession();

    // Debug: Log session untuk troubleshooting
    if (process.env.NODE_ENV === "development") {
      console.log("[Axios] Session:", session ? "Found" : "Not found");
      console.log("[Axios] Has accessToken:", !!session?.accessToken);
    }

    // Jika ada access token, inject ke header Authorization
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    } else {
      console.warn("[Axios] No accessToken found in session");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized (token expired atau invalid)
    if (error.response?.status === 401) {
      // Bisa redirect ke login page atau refresh token
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
