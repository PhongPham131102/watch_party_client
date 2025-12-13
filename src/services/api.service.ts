/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiResponse } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888/api/v1";

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds
    });

    // Request interceptor: append timestamp for cache busting (optional)
    this.axiosInstance.interceptors.request.use(
      (config) => {

        if (config.method?.toLowerCase() === "get") {
          const params = (config.params || {}) as Record<string, unknown>;
          // Chỉ thêm timestamp nếu không có sẵn
          if (!params.t) {
            (params as any).t = Date.now();
            config.params = params;
          }
        }


        if (typeof window !== "undefined") {
          const token = localStorage.getItem("authToken");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      (error:
        AxiosError) => {

        const status = error?.response?.status;

        if (typeof window !== "undefined" && status === 401) {
          localStorage.removeItem("authToken");
        }


        if (typeof window !== "undefined" && status === 404) {
          window.location.replace("/404");
          return new Promise(() => { });
        }

        throw error.response?.data as ApiResponse;
      }
    );
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.axiosInstance.get<T>(endpoint, { params }) as Promise<T>;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.axiosInstance.post<T>(endpoint, data) as Promise<T>;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.axiosInstance.put<T>(endpoint, data) as Promise<T>;
  }

  async delete<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.axiosInstance.delete<T>(endpoint, { params }) as Promise<T>;
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.axiosInstance.patch<T>(endpoint, data) as Promise<T>;
  }

  // Method để set authentication token
  setAuthToken(token: string | null) {
    if (token) {
      this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", token);
      }
    } else {
      delete this.axiosInstance.defaults.headers.common["Authorization"];
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
    }
  }

  // Method để clear authentication
  clearAuth() {
    this.setAuthToken(null);
  }
}

// Export instance để sử dụng
export const apiClient = new ApiClient();

// Export các hàm helper để tương thích với code cũ
export async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  return apiClient.get<T>(url, params);
}

export async function post<T>(url: string, data?: any): Promise<T> {
  return apiClient.post<T>(url, data);
}

export async function put<T>(url: string, data?: any): Promise<T> {
  return apiClient.put<T>(url, data);
}

export async function patch<T>(url: string, data?: any): Promise<T> {
  return apiClient.patch<T>(url, data);
}

export async function del<T>(url: string, params?: Record<string, any>): Promise<T> {
  return apiClient.delete<T>(url, params);
}
