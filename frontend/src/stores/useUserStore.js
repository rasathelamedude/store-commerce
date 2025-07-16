import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  // signup function;
  signup: async (formData) => {
    console.log("Hello I'm sign up function");
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
      toast.success("Signed up successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occured!");
    }
  },

  
}));
