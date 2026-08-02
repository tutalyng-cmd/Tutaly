import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// In-memory token storage (prevents XSS extraction from localStorage)
let memoryToken: string | null = null;

export const setMemoryToken = (token: string | null) => {
  memoryToken = token;
};

export const api = axios.create({
  baseURL,
  withCredentials: true, // Crucial for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach in-memory token
api.interceptors.request.use((config) => {
  if (memoryToken && config.headers) {
    config.headers.Authorization = `Bearer ${memoryToken}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

// Response Interceptor: Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet and not hitting refresh itself
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(
            `${baseURL}/auth/refresh`,
            {},
            { withCredentials: true }
          ).then(res => {
            const newToken = res.data.accessToken;
            setMemoryToken(newToken);
            if (typeof window !== 'undefined') {
              localStorage.setItem('access_token', newToken);
            }
            return newToken;
          }).finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

        // Update the failed request with the new token and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (cookie expired or missing) - user is truly logged out
        setMemoryToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth-logout'));

          const path = window.location.pathname;
          // Only redirect forcefully if on a protected route
          const isProtectedRoute = path.startsWith('/admin') ||
            path.startsWith('/employer') ||
            path.startsWith('/seeker') ||
            path.startsWith('/seller') ||
            path.startsWith('/dashboard') ||
            path.startsWith('/community') ||
            path.startsWith('/advertise');

          if (isProtectedRoute) {
            window.location.href = '/auth/signin';
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Keep apiAuth for backwards compatibility, but wire it to use the new api instance
export const apiAuth = {
  withToken: (token?: string) => {
    if (token) setMemoryToken(token);
    return api;
  },
};
