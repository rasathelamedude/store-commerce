import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const productIds = req.user.cartItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // products don't have quantity property;
    const cartItems = products.map((product) => {
      // find the current product in user's cart items;
      const item = req.user.cartItems.find(
        (item) => item.product.toString() === product._id.toString()
      );

      // append the cart items quantity to the product object;
      return { ...product.toJSON(), quantity: item?.quantity || 1 };
    });

    res.status(200).json({
      success: true,
      message: "Fetched user's cart items",
      data: {
        cartItems,
      },
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const user = req.user; // To access their cartItems;
    const { productId } = req.body;

    // try finding the product in the user's cartItem;
    const existingProduct = user.cartItems?.find(
      (item) => item.product.toString() === productId
    );

    if (existingProduct) {
      // if found just increament the quantity;
      existingProduct.quantity += 1;
    } else {
      // else add it;
      user.cartItems.push({ product: productId });
    }

    // save the changes;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Product added to cart",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAllFromCart = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.params;

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }

    await user.save();

    res.status(204).json({
      success: true,
      message: "Removed product successfully!",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;
    const user = req.user;

    const existingProduct = user.cartItems.find(
      (item) => item.id === productId
    );

    if (!existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product not found to add/remove!",
      });
    }

    if (quantity === 0) {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    } else {
      existingProduct.quantity += quantity;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Updated product quantity successfully!",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
