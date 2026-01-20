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
  getCoupon,
  validateCoupon,
} from "../../../controllers/coupon.controller.js";
import Coupon from "../../../models/coupon.model.js";
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
  await Coupon.deleteMany({});
  await User.deleteMany({});
});

describe("Coupon Controller", () => {
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
      ...overrides,
    };
  };

  describe("getCoupon", () => {
    it("should return active coupon for user", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const coupon = await Coupon.create({
        code: "SAVE10",
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: user._id,
        isActive: true,
      });

      const req = mockReq(user);
      const res = mockRes();

      await getCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched all coupons for user!",
        data: {
          coupon: expect.objectContaining({
            code: "SAVE10",
            discountPercentage: 10,
          }),
        },
      });
    });

    it("should return null if user has no active coupon", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const req = mockReq(user);
      const res = mockRes();

      await getCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched all coupons for user!",
        data: {
          coupon: null,
        },
      });
    });

    it("should not return inactive coupons", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      await Coupon.create({
        code: "EXPIRED10",
        discountPercentage: 10,
        expirationDate: new Date(Date.now() - 1000), // expired
        userId: user._id,
        isActive: false,
      });

      const req = mockReq(user);
      const res = mockRes();

      await getCoupon(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched all coupons for user!",
        data: {
          coupon: null,
        },
      });
    });
  });

  describe("validateCoupon", () => {
    it("should validate an active coupon with future expiration", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const coupon = await Coupon.create({
        code: "VALIDATE20",
        discountPercentage: 20,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: user._id,
        isActive: true,
      });

      const req = mockReq(user, {
        body: {
          code: "VALIDATE20",
        },
      });

      const res = mockRes();

      await validateCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched code for coupon",
        data: {
          code: "VALIDATE20",
          discount: 20,
        },
      });
    });

    it("should return error for non-existent coupon code", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const req = mockReq(user, {
        body: {
          code: "NONEXISTENT",
        },
      });

      const res = mockRes();

      await validateCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Coupon code is not valid!",
      });
    });

    it("should return error for expired coupon", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const coupon = await Coupon.create({
        code: "EXPIRED",
        discountPercentage: 15,
        expirationDate: new Date(Date.now() - 1000), // already expired
        userId: user._id,
        isActive: true,
      });

      const req = mockReq(user, {
        body: {
          code: "EXPIRED",
        },
      });

      const res = mockRes();

      await validateCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Coupon is expired!",
      });

      // Check that coupon is marked as inactive
      const updatedCoupon = await Coupon.findById(coupon._id);
      expect(updatedCoupon.isActive).toBe(false);
    });

    it("should return error for coupon not belonging to user", async () => {
      const user1 = await User.create({
        name: "User 1",
        email: "user1@example.com",
        password: "password123",
      });

      const user2 = await User.create({
        name: "User 2",
        email: "user2@example.com",
        password: "password123",
      });

      const coupon = await Coupon.create({
        code: "PRIVATE",
        discountPercentage: 25,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: user1._id,
        isActive: true,
      });

      const req = mockReq(user2, {
        body: {
          code: "PRIVATE",
        },
      });

      const res = mockRes();

      await validateCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Coupon code is not valid!",
      });
    });

    it("should not validate inactive coupon", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const coupon = await Coupon.create({
        code: "INACTIVE",
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: user._id,
        isActive: false,
      });

      const req = mockReq(user, {
        body: {
          code: "INACTIVE",
        },
      });

      const res = mockRes();

      await validateCoupon(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Coupon code is not valid!",
      });
    });
  });
});
