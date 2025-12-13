/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from "axios";

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
        // Thêm timestamp cho các request GET để tránh cache (có thể tùy chỉnh theo nhu cầu)
        if (config.method?.toLowerCase() === "get") {
          const params = (config.params || {}) as Record<string, unknown>;
          // Chỉ thêm timestamp nếu không có sẵn
          if (!params.t) {
            (params as any).t = Date.now();
            config.params = params;
          }
        }

        // Thêm authentication token nếu có (có thể lấy từ localStorage hoặc store)
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("authToken");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Log request trong development
        if (process.env.NODE_ENV === "development") {
          console.log("API Request:", {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL}${config.url}`,
          });
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const status = error?.response?.status;

        // Xử lý lỗi 401 - Unauthorized (có thể redirect đến trang login)
        if (typeof window !== "undefined" && status === 401) {
          // Xóa token nếu có
          localStorage.removeItem("authToken");
          // Có thể redirect đến trang login nếu cần
          // window.location.replace("/login");
        }

        // Xử lý lỗi 404 - Not Found
        if (typeof window !== "undefined" && status === 404) {
          // Redirect sang trang 404 và chặn luồng Promise để không hiển thị modal lỗi
          window.location.replace("/404");
          return new Promise(() => { });
        }

        // Log lỗi trong development
        if (process.env.NODE_ENV === "development") {
          console.log("API request failed:", {
            url: error?.config?.url,
            method: error?.config?.method,
            status: status,
            message: error?.response?.data?.message || error?.message,
          });
        }

        // Tạo error object với thông tin đầy đủ
        const apiError = new Error(
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred while making the request"
        ) as any;
        apiError.status = status;
        apiError.response = error?.response;
        throw apiError;
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
