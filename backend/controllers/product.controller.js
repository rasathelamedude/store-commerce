import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

// helper function to update featured products in cache;
async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();

    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating the cache!",
    });
  }
}

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

export const createProducts = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// delete product in both the database and cloudinary;
export const deleteProduct = async (req, res) => {
  try {
    // first find the product;
    const product = await Product.findById(req.params.productId);

    // check if we have it with that id;
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // check if an image was provided for it;
    if (product.image) {
      // get id of the image;
      const publicId = product.image.split("/").pop().split(".")[0];

      // delete it from cloudinary;
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        throw new Error(error);
      }
    }

    await Product.findByIdAndDelete(req.params.productId);

    res.status(204).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Fetched recommended products!",
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

export const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.categoryName;

    const products = await Product.find({ category });

    res.status(200).json({
      success: true,
      message: `Fetched products by ${category}`,
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

export const toggleFeaturedProduct = async (req, res) => {
  try {
    // get product;
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    // update isFeatured;
    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();

    // update cache;
    await updateFeaturedProductsCache();

    res.status(200).json({
      success: true,
      message: "Featured product successfully!",
      data: {
        updatedProduct,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
