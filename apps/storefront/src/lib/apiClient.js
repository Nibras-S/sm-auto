import axios from "axios";

// CRA exposes env vars prefixed with REACT_APP_. Falls back to local API.
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export const apiClient = axios.create({ baseURL });

export default apiClient;
