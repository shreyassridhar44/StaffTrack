import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// ➤ Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ➤ Handle expired/invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem("access_token");

      // Optional: redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
