import axios from "axios";
 
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/admin",
  withCredentials: true,
});
 
axiosInstance.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
 
const isAuthEndpoint = (url: string = "") => {
  const endpoints = ["/login", "/sign-in", "/register", "/forgot-password"];
  return endpoints.some((endpoint) => url.includes(endpoint));
};
 
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
   
    if (status === 401 && !isAuthEndpoint(originalRequest.url)) {
      console.warn("Unauthorized. Redirecting to /");
      return;
    }
 
    return Promise.reject(error);
  }
);
 
export default axiosInstance;