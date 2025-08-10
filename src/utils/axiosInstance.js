import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://e-commerce-back-end-kappa.vercel.app/api/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // to send cookies if needed
});

// Add a request interceptor to attach token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
