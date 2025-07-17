import toast from "react-hot-toast";
import axios from "../lib/axios.js";
import { create } from "zustand";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  // create product;
  createProduct: async (newProductData) => {
    set({ loading: true });

    try {
      const res = await axios.post("/api/v1/products", newProductData);

      set((prevState) => ({
        products: [...prevState.products, res.data.data.product],
        loading: false,
      }));

      toast.success("Product created successfully!");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
}));
