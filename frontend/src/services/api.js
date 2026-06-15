import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // Fallback to current host but port 8085 for backend
  const host = window.location.hostname || 'localhost';
  return `http://${host}:8085/api/v1`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

export const apiCall = async (url, options = {}) => {
  const method = options.method || 'GET';
  const response = await api({
    url: url,
    method: method,
    data: options.body ? JSON.parse(options.body) : undefined,
    headers: options.headers
  });
  return response.data;
};
