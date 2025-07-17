import toast from "react-hot-toast";
import axios from "../lib/axios.js";
import { create } from "zustand";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),

  // create product;
  createProduct: async (newProductData) => {
    set({ loading: true });

    try {
      const res = await axios.post("/api/v1/products", newProductData);
      const createdProduct = res?.data?.data?.product;

      if (!createdProduct) {
        throw new Error("Failed to create product");
      }

      set((prevState) => ({
        products: [...prevState.products, createdProduct],
        loading: false,
      }));

      toast.success("Product created successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message);
    }
  },

  // fetch all the products;
  fetchAllProducts: async () => {
    set({ loading: true });

    try {
      const res = await axios.get("/api/v1/products");

      set({ loading: false, products: res.data.data.products });
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch products");
    }
  },

  // toggle featured product;
  toggleFeaturedProduct: async (id) => {
    set({ loading: true });

    try {
      await axios.patch(`/api/v1/products/${id}`);

      // Update the isFeatured prop of the product;
      set((prevState) => ({
        products: prevState.products.map((product) =>
          product._id === id
            ? { ...product, isFeatured: !product.isFeatured }
            : product
        ),
        loading: false,
      }));

      toast.success("Featured product successfully!");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // delete product;
  deleteProduct: async (id) => {
    set({ loading: true });

    try {
      await axios.delete(`/api/v1/products/${id}`);

      set((prevState) => ({
        products: prevState.products.filter((product) => product._id !== id),
        loading: false,
      }));

      toast.success("Product deleted successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message);
    }
  },
}));
