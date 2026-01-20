import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import {
  getCartProducts,
  addToCart,
  deleteAllFromCart,
  updateQuantity,
} from "../../../controllers/cart.controller.js";
import Product from "../../../models/product.model.js";
import User from "../../../models/user.model.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
  await User.deleteMany({});
});

describe("Cart Controller", () => {
  const mockRes = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    return res;
  };

  const mockReq = (user, overrides = {}) => {
    return {
      user,
      body: {},
      params: {},
      ...overrides,
    };
  };

  describe("getCartProducts", () => {
    it("should return cart products with quantities", async () => {
      const product1 = await Product.create({
        name: "Product 1",
        description: "Desc 1",
        price: 100,
        category: "Electronics",
      });

      const product2 = await Product.create({
        name: "Product 2",
        description: "Desc 2",
        price: 200,
        category: "Books",
      });

      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        cartItems: [
          { product: product1._id, quantity: 2 },
          { product: product2._id, quantity: 1 },
        ],
      });

      const req = mockReq(user);
      const res = mockRes();

      await getCartProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched user's cart items",
        data: {
          cartItems: expect.arrayContaining([
            expect.objectContaining({
              name: "Product 1",
              quantity: 2,
            }),
            expect.objectContaining({
              name: "Product 2",
              quantity: 1,
            }),
          ]),
        },
      });
    });

    it("should return empty cart when user has no items", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        cartItems: [],
      });

      const req = mockReq(user);
      const res = mockRes();

      await getCartProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched user's cart items",
        data: {
          cartItems: [],
        },
      });
    });
  });

  describe("addToCart", () => {
    it("should add new product to cart", async () => {
      const product = await Product.create({
        name: "Product",
        description: "Desc",
        price: 100,
        category: "Electronics",
      });

      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        cartItems: [],
      });

      const req = mockReq(user, {
        body: {
          productId: product._id.toString(),
        },
      });

      const res = mockRes();

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Product added to cart",
      });

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.cartItems.length).toBe(1);
      expect(updatedUser.cartItems[0].quantity).toBe(1);
    });

    it("should increment quantity if product already in cart", async () => {
      const product = await Product.create({
        name: "Product",
        description: "Desc",
        price: 100,
        category: "Electronics",
      });

      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        cartItems: [{ product: product._id, quantity: 1 }],
      });

      const req = mockReq(user, {
        body: {
          productId: product._id.toString(),
        },
      });

      const res = mockRes();

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.cartItems[0].quantity).toBe(2);
    });
  });

  describe("deleteAllFromCart", () => {
    it("should clear all items from cart when no productId provided", async () => {
      const product = await Product.create({
        name: "Product",
        description: "Desc",
        price: 100,
        category: "Electronics",
      });

      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        cartItems: [{ product: product._id, quantity: 2 }],
      });

      const req = mockReq(user, {
        params: {},
      });

      const res = mockRes();

      await deleteAllFromCart(req, res);

      expect(res.status).toHaveBeenCalledWith(204);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.cartItems.length).toBe(0);
    });

    it("should remove specific product from cart", async () => {
      const product1 = await Product.create({
        name: "Product 1",
        description: "Desc 1",
        price: 100,
        category: "Electronics",
      });

      const product2 = await Product.create({
        name: "Product 2",
        description: "Desc 2",
        price: 200,
        category: "Books",
      });

      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        cartItems: [
          { product: product1._id, quantity: 1 },
          { product: product2._id, quantity: 2 },
        ],
      });

      const req = mockReq(user, {
        params: {
          productId: product1._id.toString(),
        },
      });

      const res = mockRes();

      await deleteAllFromCart(req, res);

      expect(res.status).toHaveBeenCalledWith(204);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.cartItems.length).toBe(1);
      expect(updatedUser.cartItems[0].product.toString()).toBe(
        product2._id.toString(),
      );
    });
  });

  describe("updateQuantity", () => {
    it("should update product quantity in cart", async () => {
      const product = await Product.create({
        name: "Product",
        description: "Desc",
        price: 100,
        category: "Electronics",
      });

      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        cartItems: [{ product: product._id, quantity: 1 }],
      });

      const req = mockReq(user, {
        params: {
          productId: product._id.toString(),
        },
        body: {
          quantity: 2,
        },
      });

      const res = mockRes();

      await updateQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Updated product quantity successfully!",
      });

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.cartItems[0].quantity).toBe(2);
    });

    it("should return error if product not found in cart", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        cartItems: [],
      });

      const req = mockReq(user, {
        params: {
          productId: "nonexistent",
        },
        body: {
          quantity: 1,
        },
      });

      const res = mockRes();

      await updateQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Product not found to add/remove!",
      });
    });

    it("should remove product when quantity is 0", async () => {
      const product = await Product.create({
        name: "Product",
        description: "Desc",
        price: 100,
        category: "Electronics",
      });

      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        cartItems: [{ product: product._id, quantity: 1 }],
      });

      const req = mockReq(user, {
        params: {
          productId: product._id.toString(),
        },
        body: {
          quantity: 0,
        },
      });

      const res = mockRes();

      await updateQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.cartItems.length).toBe(0);
    });
  });
});
