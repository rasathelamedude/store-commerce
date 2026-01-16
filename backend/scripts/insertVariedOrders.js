import mongoose from "mongoose";
import { connectToDatabase } from "../lib/database.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

async function insertVariedOrdersWithDates() {
  try {
    await connectToDatabase();
    console.log("Connected to database");

    // Get a user (or create one for testing)
    let user = await User.findOne();
    if (!user) {
      console.log("No users found. Please create a user first.");
      process.exit(1);
    }

    // Get products
    const products = await Product.find();
    if (products.length === 0) {
      console.log("No products found. Please create products first.");
      process.exit(1);
    }

    // Create orders with dates spread across the past 7 days
    const orders = [];
    const today = new Date();

    for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
      const orderDate = new Date(today);
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
      );

      // Random number of products per order (1-3)
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      let totalAmount = 0;

      for (let i = 0; i < numProducts; i++) {
        const randomProduct =
          products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        selectedProducts.push({
          product: randomProduct._id,
          quantity,
          price: randomProduct.price,
        });
        totalAmount += randomProduct.price * quantity;
      }

      orders.push({
        user: user._id,
        products: selectedProducts,
        totalAmount,
        stripeSessionId: `stripe_session_${Date.now()}_${daysAgo}_${Math.random()
          .toString(36)
          .substring(7)}`,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    // Insert orders
    const insertedOrders = await Order.insertMany(orders);
    console.log(
      `\n✅ Successfully inserted ${insertedOrders.length} orders with varied dates:`
    );
    insertedOrders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  Total Amount: $${order.totalAmount.toFixed(2)}`);
      console.log(`  Products: ${order.products.length}`);
      console.log(`  Created: ${order.createdAt}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error inserting orders:", error.message);
    process.exit(1);
  }
}

insertVariedOrdersWithDates();
