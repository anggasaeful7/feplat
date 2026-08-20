import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import { readToken, clearAuth } from "./auth-storage";
import type { ApiEnvelope, ApiErrorBody } from "@/types";

const API_BASE =
  typeof window !== "undefined"
    ? ""
    : (process.env.PLATFORM_API_BASE_URL || "http://localhost:8080");

export const API_URL = typeof window !== "undefined" ? "/api" : `${API_BASE}/api/v1`;

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;
  constructor(status: number, body: ApiErrorBody["error"]) {
    super(body.message);
    this.code = body.code;
    this.status = status;
    this.details = body.details;
  }
}

export function authHeaders(): Record<string, string> {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Create an Axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Request interceptor to attach the token
axiosInstance.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const token = readToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("spc_session")?.value;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore error if cookies cannot be read
    }
  }
  return config;
});

// Response interceptor to handle 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        clearAuth();
        // Do not redirect to login if we are already on the login page or the request is for login
        const isLoginPage = window.location.pathname === "/login";
        const isLoginRequest = error.config?.url?.includes("/auth/login");
        if (!isLoginPage && !isLoginRequest) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Generic api function
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const config: AxiosRequestConfig = {
      url: path,
      method: init?.method || "GET",
      headers: init?.headers as AxiosRequestConfig["headers"],
    };

    if (init?.body) {
      if (typeof init.body === "string") {
        config.data = JSON.parse(init.body);
      } else {
        config.data = init.body;
      }
    }

    const res: AxiosResponse<ApiEnvelope<T> | ApiErrorBody> = await axiosInstance.request(config);

    if (res.status === 204) return undefined as T;

    const body = res.data;
    if (body && "data" in body) return body.data;

    return undefined as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorBody>;
      const status = axiosError.response?.status || 500;
      const body = axiosError.response?.data;

      if (body && "error" in body) {
        throw new ApiError(status, body.error);
      }

      throw new ApiError(status, {
        code: "unknown",
        message: axiosError.message || `Request failed (${status})`,
      });
    }
    throw error;
  }
}

// downloadFile mengambil respons biner (PDF/XLSX) dan memicu unduhan di browser.
export async function downloadFile(path: string, filename: string): Promise<void> {
  try {
    const res = await axiosInstance.get<Blob>(path, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      // Respons error tetap berupa Blob karena responseType: "blob".
      const raw = error.response?.data;
      if (raw instanceof Blob) {
        try {
          const body = JSON.parse(await raw.text()) as ApiErrorBody;
          if (body?.error) throw new ApiError(status, body.error);
        } catch (parseError) {
          if (parseError instanceof ApiError) throw parseError;
        }
      }
      throw new ApiError(status, {
        code: "unknown",
        message: error.message || `Download failed (${status})`,
      });
    }
    throw error;
  }
}
