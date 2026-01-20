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
  createCheckoutSession,
  checkoutSuccess,
} from "../../../controllers/payment.controller.js";
import Order from "../../../models/order.model.js";
import Coupon from "../../../models/coupon.model.js";
import User from "../../../models/user.model.js";
import { stripe } from "../../../lib/stripe.js";

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
  await Coupon.deleteMany({});
  await User.deleteMany({});
  jest
    .spyOn(stripe.checkout.sessions, "create")
    .mockResolvedValue({ id: "session_mock" });
  jest
    .spyOn(stripe.checkout.sessions, "retrieve")
    .mockResolvedValue({ payment_status: "paid" });
  jest.spyOn(stripe.coupons, "create").mockResolvedValue({ id: "coupon_mock" });
});

describe("Payment Controller", () => {
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

  describe("createCheckoutSession", () => {
    it("should return error for invalid products array", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const req = mockReq(user, {
        body: {
          products: [],
          couponCode: null,
        },
      });

      const res = mockRes();

      await createCheckoutSession(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid or empty products array!",
      });
    });

    it("should return error for non-array products", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const req = mockReq(user, {
        body: {
          products: "not-an-array",
          couponCode: null,
        },
      });

      const res = mockRes();

      await createCheckoutSession(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should create checkout session with valid products", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      stripe.checkout.sessions.create.mockResolvedValue({
        id: "cs_test_123",
      });

      stripe.coupons.create.mockResolvedValue({
        id: "coupon_123",
      });

      const req = mockReq(user, {
        body: {
          products: [
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Product 1",
              price: 100,
              quantity: 2,
              image: "https://example.com/image.jpg",
            },
          ],
          couponCode: null,
        },
      });

      const res = mockRes();

      await createCheckoutSession(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        sessionId: "cs_test_123",
        totalAmount: 200,
      });
      expect(stripe.checkout.sessions.create).toHaveBeenCalled();
    });

    it("should apply coupon discount if valid coupon provided", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const coupon = await Coupon.create({
        code: "SAVE20",
        discountPercentage: 20,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: user._id,
        isActive: true,
      });

      stripe.checkout.sessions.create.mockResolvedValue({
        id: "cs_test_456",
      });

      stripe.coupons.create.mockResolvedValue({
        id: "coupon_456",
      });

      const req = mockReq(user, {
        body: {
          products: [
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Product 1",
              price: 100,
              quantity: 1,
              image: null,
            },
          ],
          couponCode: "SAVE20",
        },
      });

      const res = mockRes();

      await createCheckoutSession(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // 100 * 100 cents = 10000, minus 20% discount = 8000, / 100 = 80
      expect(res.json).toHaveBeenCalledWith({
        sessionId: "cs_test_456",
        totalAmount: 80,
      });
    });

    it("should create coupon if total amount >= 20000 cents", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      stripe.checkout.sessions.create.mockResolvedValue({
        id: "cs_test_789",
      });

      const req = mockReq(user, {
        body: {
          products: [
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Expensive Product",
              price: 300,
              quantity: 1,
              image: null,
            },
          ],
          couponCode: null,
        },
      });

      const res = mockRes();

      await createCheckoutSession(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      // Check if new coupon was created
      const newCoupon = await Coupon.findOne({ userId: user._id });
      expect(newCoupon).toBeTruthy();
      expect(newCoupon.code).toMatch(/^GIFT/);
      expect(newCoupon.discountPercentage).toBe(10);
    });
  });

  describe("checkoutSuccess", () => {
    it("should create order for successful payment", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const productId = new mongoose.Types.ObjectId();

      stripe.checkout.sessions.retrieve.mockResolvedValue({
        payment_status: "paid",
        amount_total: 30000,
        metadata: {
          userId: user._id.toString(),
          couponCode: "",
          products: JSON.stringify([
            {
              _id: productId,
              quantity: 2,
              price: 150,
            },
          ]),
        },
      });

      const req = mockReq(user, {
        body: {
          sessionId: "cs_test_success",
        },
      });

      const res = mockRes();

      await checkoutSuccess(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message:
          "Payment successfull, order created, and coupon deactivated if used!",
        data: {
          orderId: expect.any(mongoose.Types.ObjectId),
        },
      });

      const order = await Order.findOne({ user: user._id });
      expect(order).toBeTruthy();
      expect(order.products.length).toBe(1);
      expect(order.totalAmount).toBe(300);
    });

    it("should deactivate coupon if used", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const coupon = await Coupon.create({
        code: "USED",
        discountPercentage: 15,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: user._id,
        isActive: true,
      });

      const productId = new mongoose.Types.ObjectId();

      stripe.checkout.sessions.retrieve.mockResolvedValue({
        payment_status: "paid",
        amount_total: 20000,
        metadata: {
          userId: user._id.toString(),
          couponCode: "USED",
          products: JSON.stringify([
            {
              _id: productId,
              quantity: 1,
              price: 200,
            },
          ]),
        },
      });

      const req = mockReq(user, {
        body: {
          sessionId: "cs_test_coupon",
        },
      });

      const res = mockRes();

      await checkoutSuccess(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const deactivatedCoupon = await Coupon.findById(coupon._id);
      expect(deactivatedCoupon.isActive).toBe(false);
    });

    it("should return error if payment not successful", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      stripe.checkout.sessions.retrieve.mockResolvedValue({
        payment_status: "unpaid",
      });

      const req = mockReq(user, {
        body: {
          sessionId: "cs_test_failed",
        },
      });

      const res = mockRes();

      await checkoutSuccess(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Session not paid!",
      });
    });
  });
});
