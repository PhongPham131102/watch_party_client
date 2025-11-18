import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function get<T>(url: string, params?: object): Promise<T> {
  const response = await api.get<T>(url, { params });
  return response.data;
}

export async function post<T>(url: string, data?: object): Promise<T> {
  const response = await api.post<T>(url, data);
  return response.data;
}

export async function put<T>(url: string, data?: object): Promise<T> {
  const response = await api.put<T>(url, data);
  return response.data;
}

export async function patch<T>(url: string, data?: object): Promise<T> {
  const response = await api.patch<T>(url, data);
  return response.data;
}

export async function del<T>(url: string, params?: object): Promise<T> {
  const response = await api.delete<T>(url, { params });
  return response.data;
}
