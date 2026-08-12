import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_URL || "http://localhost:4500",
  withCredentials: true,
});

export default axiosInstance;
