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
        }
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
        }
      );

      set({ user: res.data.data.user, loading: false });
      toast.success(res.data.message);
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occured.");
    }
  },
}));
