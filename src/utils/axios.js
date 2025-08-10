import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://e-commerce-back-end-kappa.vercel.app/api/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // to send cookies if needed
});

export default axiosInstance;
