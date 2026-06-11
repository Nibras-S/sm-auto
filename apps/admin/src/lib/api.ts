import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

/** Shared axios instance. `withCredentials` so the httpOnly refresh cookie is sent. */
export const api = axios.create({ baseURL, withCredentials: true });

// Access token is kept in memory only (Appendix A, fix #3 — never in localStorage).
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Single-flight refresh: many 401s share one refresh request.
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const res = await axios.post(`${baseURL}/auth/admin/refresh`, {}, { withCredentials: true });
  const token = res.data.accessToken as string;
  setAccessToken(token);
  return token;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthRoute = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        refreshing = refreshing ?? refreshAccessToken();
        const token = await refreshing;
        refreshing = null;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshErr) {
        refreshing = null;
        setAccessToken(null);
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  },
);
