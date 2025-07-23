import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  loading: false,
  total: 0,
  subtotal: 0,

  getCartItems: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/api/v1/cart");
      const cart = res.data.data.cart;
      set({ cart, loading: false });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [], loading: false });
      toast.error(error.response.data.message);
    }
  },

  addToCart: async (product) => {
    set({ loading: true });
    try {
      const res = await axios.post("/api/v1/cart", { productId: product._id });
      toast.success(res.data.message);

      set((state) => {
        const existingItem = state.cart.find(
          (item) => item._id === product._id
        );

        const newCart = existingItem
          ? state.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...state.cart, { ...product, quantity: 1 }];

        return { cart: newCart, loading: false };
      });

      get().calculateTotals();
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occured.");
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();

    const subtotal = cart.reduce((sum, item) => {
      sum + item.price * item.quantity;
    }, 0);

    let total = subtotal;

    if (coupon) {
      total = subtotal - (subtotal * coupon.discount) / 100;
    }

    set({ subtotal, total });
  },
}));
