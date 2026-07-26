import axios from "axios";

// Helper to get cookies by name on the client side
export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT Access Token and CSRF Token
client.interceptors.request.use(
  async (config) => {
    // 1. Attach CSRF Token if present in cookies
    const csrfToken = getCookie("csrfToken");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    // 2. Attach Authorization Bearer Token
    // We import dynamically to avoid circular dependencies in module loading
    const { useAuthStore } = await import("../store/authStore");
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request has not been retried, excluding auth endpoints
    const isAuthRequest = originalRequest.url?.includes("/auth/refresh-token") || 
                          originalRequest.url?.includes("/auth/logout") || 
                          originalRequest.url?.includes("/auth/login");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        // If token refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { useAuthStore } = await import("../store/authStore");
        
        // Call refresh-token endpoint on backend
        const response = await axios.post(
          `${client.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data?.data?.accessToken;
        
        if (!newAccessToken) {
          throw new Error("Failed to rotate token");
        }

        // Store the new token in Zustand
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Process all queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Only log out user if the refresh request explicitly fails with 400, 401, or 403 (unauthorized/invalid token)
        // If it's a network offline error or 5xx temporary server issue, we preserve the user's active session
        const axiosError = refreshError as { response?: { status: number } };
        const status = axiosError.response?.status;
        const shouldLogout = status !== undefined && (status === 400 || status === 401 || status === 403);
        
        if (shouldLogout) {
          const { useAuthStore } = await import("../store/authStore");
          useAuthStore.getState().logoutUser();
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
