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
      withCredentials: true, // Cho phép gửi cookies trong request
    });

    // Request interceptor: append timestamp for cache busting (optional)
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Handle server-side cookie injection for Next.js App Router
        if (typeof window === "undefined") {
          try {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            const cookieHeader = cookieStore.toString();
            if (cookieHeader) {
              config.headers.Cookie = cookieHeader;
            }
          } catch (error) {
            // Context might not support next/headers (e.g. static generation)
            console.debug(
              "Failed to inject server cookies via interceptor",
              error
            );
          }
        }

        if (config.method?.toLowerCase() === "get") {
          const params = (config.params || {}) as Record<string, unknown>;
          // Chỉ thêm timestamp nếu không có sẵn
          if (!params.t) {
            (params as any).t = Date.now();
            config.params = params;
          }
        }

        // Không cần lấy token từ localStorage nữa vì backend sẽ tự động đọc từ cookies
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        const status = error?.response?.status;

        // Khi 401, cookies sẽ tự động bị xóa bởi backend hoặc hết hạn
        // Client chỉ cần redirect hoặc thông báo
        if (typeof window !== "undefined" && status === 401) {
          // Có thể dispatch event để AuthInitProvider biết và logout
          window.dispatchEvent(new Event("unauthorized"));
        }

        if (typeof window !== "undefined" && status === 404) {
          window.location.replace("/404");
          return new Promise(() => {});
        }

        throw error.response?.data as ApiResponse;
      }
    );
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: any
  ): Promise<T> {
    return this.axiosInstance.get<T>(endpoint, {
      params,
      ...config,
    }) as Promise<T>;
  }

  async post<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    return this.axiosInstance.post<T>(endpoint, data, config) as Promise<T>;
  }

  async put<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    return this.axiosInstance.put<T>(endpoint, data, config) as Promise<T>;
  }

  async delete<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: any
  ): Promise<T> {
    return this.axiosInstance.delete<T>(endpoint, {
      params,
      ...config,
    }) as Promise<T>;
  }

  async patch<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    return this.axiosInstance.patch<T>(endpoint, data, config) as Promise<T>;
  }
}

// Export instance để sử dụng
export const apiClient = new ApiClient();

// Export các hàm helper để tương thích với code cũ
export async function get<T>(
  url: string,
  params?: Record<string, any>
): Promise<T> {
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

export async function del<T>(
  url: string,
  params?: Record<string, any>
): Promise<T> {
  return apiClient.delete<T>(url, params);
}
