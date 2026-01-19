import Coupon from "../../../models/coupon.model.js";
import mongoose from "mongoose";

describe("Coupon Model", () => {
  const validCouponData = {
    code: "SAVE10",
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: new mongoose.Types.ObjectId(),
  };

  it("should create a coupon with valid properties", () => {
    const coupon = new Coupon(validCouponData);
    expect(coupon.code).toBe("SAVE10");
    expect(coupon.discountPercentage).toBe(10);
    expect(coupon.isActive).toBe(true);
    expect(coupon.expirationDate).toBeDefined();
    expect(coupon.userId).toBeDefined();
  });

  it("should not create a coupon without a code", () => {
    const coupon = new Coupon({
      ...validCouponData,
      code: undefined,
    });
    const error = coupon.validateSync();
    expect(error.errors.code).toBeDefined();
  });

  it("should not create a coupon without expirationDate", () => {
    const coupon = new Coupon({
      ...validCouponData,
      expirationDate: undefined,
    });
    const error = coupon.validateSync();
    expect(error.errors.expirationDate).toBeDefined();
  });

  it("should not create a coupon without userId", () => {
    const coupon = new Coupon({
      ...validCouponData,
      userId: undefined,
    });
    const error = coupon.validateSync();
    expect(error.errors.userId).toBeDefined();
  });

  it("should not create a coupon with a negative discountPercentage", () => {
    const coupon = new Coupon({
      ...validCouponData,
      discountPercentage: -5,
    });
    const error = coupon.validateSync();
    expect(error.errors.discountPercentage).toBeDefined();
  });

  it("should not create a coupon with discountPercentage over 100", () => {
    const coupon = new Coupon({
      ...validCouponData,
      discountPercentage: 150,
    });
    const error = coupon.validateSync();
    expect(error.errors.discountPercentage).toBeDefined();
  });

  it("should have isActive default to true", () => {
    const coupon = new Coupon(validCouponData);
    expect(coupon.isActive).toBe(true);
  });
});
