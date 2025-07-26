import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { data } from "react-router-dom";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  loading: false,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

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

  removeFromCart: async (productId) => {
    try {
      await axios.delete(`/api/v1/cart/${productId}`);

      const newCart = get().cart.filter((item) => item._id !== productId);

      get().calculateTotals();
      toast.success("Product removed from cart successfully!");
      set({ cart: newCart });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      get().removeFromCart(productId);
      return;
    }

    try {
      await axios.patch(`/api/v1/cart/${productId}`, { quantity });

      set((prevState) => ({
        cart: prevState.cart.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        ),
      }));

      get().calculateTotals();
    } catch (error) {
      toast.error(error.response.data.message);
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
