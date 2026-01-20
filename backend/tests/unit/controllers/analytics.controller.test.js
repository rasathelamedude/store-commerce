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
import { getAnalytics } from "../../../controllers/analytics.controller.js";
import Order from "../../../models/order.model.js";
import User from "../../../models/user.model.js";
import Product from "../../../models/product.model.js";

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
  await Order.deleteMany({});
  await User.deleteMany({});
  await Product.deleteMany({});
});

describe("Analytics Controller", () => {
  const mockRes = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    return res;
  };

  const mockReq = () => {
    return {
      user: null,
    };
  };

  describe("getAnalytics", () => {
    it("should return analytics data with all counts as zero when no data exists", async () => {
      const req = mockReq();
      const res = mockRes();

      await getAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched analytics",
        data: {
          analyticsData: {
            users: 0,
            products: 0,
            sales: 0,
            revenue: 0,
          },
          dailySalesData: expect.any(Array),
        },
      });
    });

    it("should return correct count of users", async () => {
      await User.create([
        { name: "User 1", email: "user1@example.com", password: "pass123" },
        { name: "User 2", email: "user2@example.com", password: "pass123" },
        { name: "User 3", email: "user3@example.com", password: "pass123" },
      ]);

      const req = mockReq();
      const res = mockRes();

      await getAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const callData = res.json.mock.calls[0][0];
      expect(callData.data.analyticsData.users).toBe(3);
    });

    it("should return correct count of products", async () => {
      await Product.create([
        {
          name: "Product 1",
          description: "Desc 1",
          price: 100,
          category: "Electronics",
        },
        {
          name: "Product 2",
          description: "Desc 2",
          price: 200,
          category: "Books",
        },
      ]);

      const req = mockReq();
      const res = mockRes();

      await getAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const callData = res.json.mock.calls[0][0];
      expect(callData.data.analyticsData.products).toBe(2);
    });

    it("should return correct sales count and revenue", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const product = await Product.create({
        name: "Product",
        description: "Desc",
        price: 100,
        category: "Electronics",
      });

      await Order.create([
        {
          user: user._id,
          products: [
            {
              product: product._id,
              quantity: 2,
              price: 100,
            },
          ],
          totalAmount: 200,
          stripeSessionId: `session_${Date.now()}_1`,
        },
        {
          user: user._id,
          products: [
            {
              product: product._id,
              quantity: 1,
              price: 100,
            },
          ],
          totalAmount: 100,
          stripeSessionId: `session_${Date.now()}_2`,
        },
      ]);

      const req = mockReq();
      const res = mockRes();

      await getAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const callData = res.json.mock.calls[0][0];
      expect(callData.data.analyticsData.sales).toBe(2);
      expect(callData.data.analyticsData.revenue).toBe(300);
    });

    it("should include daily sales data for 7-day period", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const product = await Product.create({
        name: "Product",
        description: "Desc",
        price: 100,
        category: "Electronics",
      });

      // Create order from today
      const today = new Date();
      await Order.create({
        user: user._id,
        products: [
          {
            product: product._id,
            quantity: 1,
            price: 100,
          },
        ],
        totalAmount: 100,
        createdAt: today,
      });

      const req = mockReq();
      const res = mockRes();

      await getAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const callData = res.json.mock.calls[0][0];
      expect(Array.isArray(callData.data.dailySalesData)).toBe(true);
      expect(callData.data.dailySalesData.length).toBe(8); // 7 days ago + today = 8 days
    });

    it("should show zero revenue and sales for dates with no orders", async () => {
      const req = mockReq();
      const res = mockRes();

      await getAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const callData = res.json.mock.calls[0][0];
      const dailyData = callData.data.dailySalesData;

      // All days should have 0 sales and revenue
      dailyData.forEach((day) => {
        expect(day.sales).toBe(0);
        expect(day.revenue).toBe(0);
      });
    });

    it("should include correct date format in daily sales data", async () => {
      const req = mockReq();
      const res = mockRes();

      await getAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const callData = res.json.mock.calls[0][0];
      const dailyData = callData.data.dailySalesData;

      dailyData.forEach((day) => {
        // Check if date is in YYYY-MM-DD format
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(day).toHaveProperty("sales");
        expect(day).toHaveProperty("revenue");
      });
    });

    it("should handle errors gracefully", async () => {
      const req = mockReq();
      const res = mockRes();

      // Mock an error in the aggregation
      const originalFind = Order.aggregate;
      Order.aggregate = jest.fn().mockImplementation(() => {
        throw new Error("Database error");
      });

      await getAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });

      Order.aggregate = originalFind;
    });

    it("should return complete analytics response structure", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const product = await Product.create({
        name: "Product",
        description: "Desc",
        price: 100,
        category: "Electronics",
      });

      await Order.create({
        user: user._id,
        products: [
          {
            product: product._id,
            quantity: 1,
            price: 100,
          },
        ],
        totalAmount: 100,
        stripeSessionId: `session_error_${Date.now()}`,
        stripeSessionId: `session_daily_${Date.now()}`,
      });

      const req = mockReq();
      const res = mockRes();

      await getAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const callData = res.json.mock.calls[0][0];

      expect(callData).toHaveProperty("success", true);
      expect(callData).toHaveProperty("message", "Fetched analytics");
      expect(callData.data).toHaveProperty("analyticsData");
      expect(callData.data).toHaveProperty("dailySalesData");
      expect(callData.data.analyticsData).toHaveProperty("users");
      expect(callData.data.analyticsData).toHaveProperty("products");
      expect(callData.data.analyticsData).toHaveProperty("sales");
      expect(callData.data.analyticsData).toHaveProperty("revenue");
    });
  });
});
