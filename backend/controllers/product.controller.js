import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      message: "Fetched all the products",
      data: {
        products,
      },
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    // 1. check if we have them cached;
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.status(200).json({
        success: true,
        message: "Fetched featured products",
        result: featuredProducts.length,
        data: {
          featuredProducts: JSON.parse(featuredProducts),
        },
      });
    }

    // Else fetch them from the database;
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    // check if we have any featured products;
    if (!featuredProducts) {
      return res.status(404).json({
        success: false,
        message: "No featured products found in the database!",
      });
    }

    // After fetching it from the database, store it in the cache;
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    // send back response;
    res.status(200).json({
      success: true,
      message: "Fetched featured products",
      result: featuredProducts.length,
      data: {
        featuredProducts,
      },
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
