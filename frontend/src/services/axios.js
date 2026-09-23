import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});


// ==========================================
// REQUEST INTERCEPTOR
// JWT TOKEN AUTOMATICALLY ATTACH HOGA
// ==========================================

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


// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {

    // Token expired / unauthorized
    if (error.response?.status === 401) {

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Login page par bhejna
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;