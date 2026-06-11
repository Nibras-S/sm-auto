import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

// withCredentials so the httpOnly customer refresh cookie is sent.
export const apiClient = axios.create({ baseURL, withCredentials: true });

// Access token kept in memory only.
let accessToken = null;
export const setAccessToken = (t) => {
  accessToken = t;
};
export const getAccessToken = () => accessToken;

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing = null;
async function refresh() {
  const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
  setAccessToken(res.data.accessToken);
  return res.data.accessToken;
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const isAuth = original?.url?.includes("/auth/");
    if (error.response?.status === 401 && original && !original._retry && !isAuth) {
      original._retry = true;
      try {
        refreshing = refreshing ?? refresh();
        const t = await refreshing;
        refreshing = null;
        original.headers.Authorization = `Bearer ${t}`;
        return apiClient(original);
      } catch (e) {
        refreshing = null;
        setAccessToken(null);
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
