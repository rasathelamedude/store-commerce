import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.mode === "development" ? "http://localhost:5110" : "/",
  withCredentials: true, // send cookies in the requests;
});

export default axiosInstance;
