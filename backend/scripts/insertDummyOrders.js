import mongoose from "mongoose";
import { connectToDatabase } from "../lib/database.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

async function insertDummyOrders() {
  try {
    await connectToDatabase();
    console.log("Connected to database");

    // Get a user (or create one for testing)
    let user = await User.findOne();
    if (!user) {
      console.log("No users found. Please create a user first.");
      process.exit(1);
    }

    // Get some products
    const products = await Product.find().limit(3);
    if (products.length === 0) {
      console.log("No products found. Please create products first.");
      process.exit(1);
    }

    // Create dummy orders
    const dummyOrders = [
      {
        user: user._id,
        products: [
          {
            product: products[0]._id,
            quantity: 2,
            price: products[0].price,
          },
        ],
        totalAmount: products[0].price * 2,
        stripeSessionId: `stripe_session_${Date.now()}_1`,
      },
      {
        user: user._id,
        products: [
          {
            product: products[1]._id,
            quantity: 1,
            price: products[1].price,
          },
          {
            product: products[2]._id,
            quantity: 3,
            price: products[2].price,
          },
        ],
        totalAmount: products[1].price * 1 + products[2].price * 3,
        stripeSessionId: `stripe_session_${Date.now()}_2`,
      },
      {
        user: user._id,
        products: products.map((product) => ({
          product: product._id,
          quantity: 1,
          price: product.price,
        })),
        totalAmount: products.reduce((sum, p) => sum + p.price, 0),
        stripeSessionId: `stripe_session_${Date.now()}_3`,
      },
    ];

    // Insert orders
    const insertedOrders = await Order.insertMany(dummyOrders);
    console.log(
      `\n✅ Successfully inserted ${insertedOrders.length} dummy orders:`
    );
    insertedOrders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  Total Amount: $${order.totalAmount}`);
      console.log(`  Products: ${order.products.length}`);
      console.log(`  Created: ${order.createdAt}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error inserting dummy orders:", error.message);
    process.exit(1);
  }
}

insertDummyOrders();
