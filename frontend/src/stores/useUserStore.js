import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  // signup function;
  signup: async (formData) => {
    set({ loading: true });

    if (formData.password !== formData.confirmPassword) {
      set({ loading: false });
      toast.error("Passwords don't match!");
      return;
    }

    try {
      const res = await axios.post(
        "/api/v1/auth/sign-up",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      set({ user: res.data.data.user, loading: false });
      toast.success(res.data.message);
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occured!");
    }
  },

  // login function;
  login: async (email, password) => {
    try {
      set({ loading: true });

      const res = await axios.post(
        "/api/v1/auth/sign-in",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      set({ user: res.data.data.user, loading: false });
      toast.success(res.data.message);
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occured.");
    }
  },

  // Check authentication function;
  checkAuth: async () => {
    set({ checkingAuth: true });

    try {
      const res = await axios.get("/api/v1/auth/profile");
      set({ user: res.data.data.user, checkingAuth: false });
    } catch (error) {
      set({ checkingAuth: false, user: null });
    }
  },

  logout: async () => {
    try {
      await axios.post("/api/v1/auth/sign-out");

      set({ user: null });

      toast.success("Signed out successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  // Fetching all the products;
  fetchAllProducts: async () => {
    try {
      set({ loading: true });
      const products = await axios.get("/api/v1/products/");

      set({ loading: false });
      return products;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  refreshToken: async () => {
    // Prevent multiple simultaneous refresh attempts
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post("/api/v1/auth/refresh-token");
      set({ checkingAuth: false });
      return response;
    } catch (error) {
      set({ checkingAuth: false, user: null });
      throw error;
    }
  },
}));

// Axios interceptors
let refreshPromise = null;

axios.interceptors.response.use(
  // If no errors then return the response as it is
  (response) => response,

  // If there is an error
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // if a refresh is already in progress wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // Start a new refreshing process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // If refreshing process fails redirect to login
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
