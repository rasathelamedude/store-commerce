import React from "react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem.jsx";
import PeopleAlsoBought from "../components/PeopleAlsoBought.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import GiftCouponCard from "../components/GiftCouponCard.jsx";

const CartPage = () => {
  const { getCartItems, cart } = useCartStore();

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto flex-none w-full lg:max-w-2xl xl:max-w-4xl"
          >
            {cart.length === 0 ? (
              <EmptyCartUI />
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
            )}

            {cart.length > 0 && <PeopleAlsoBought />}
          </motion.div>

          {cart.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-6 flex-1 max-w-4xl space-y-6 lg:mt-0 lg:w-full"
            >
              <OrderSummary />
              <GiftCouponCard />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyCartUI = () => {
  <motion.div
    className="flex flex-col items-center justify-center space-y-4 py-16"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
  >
    <ShoppingCart className="text-gray-300 h-24 w-24" />
    <h3 className="text-2xl font-semibold">Your cart is empty</h3>
    <p className="text-gray-400">
      Looks like you {"haven't"} added anything to your cart yet.
    </p>
    <Link>Start Shopping</Link>
  </motion.div>;
};

export default CartPage;
