import Order from "../../../models/order.model.js";
import mongoose from "mongoose";

describe("Order Model", () => {
  const validOrderData = {
    user: new mongoose.Types.ObjectId(),
    products: [
      {
        product: new mongoose.Types.ObjectId(),
        quantity: 2,
        price: 50,
      },
    ],
    totalAmount: 100,
  };

  it("should create an order with valid properties", () => {
    const order = new Order(validOrderData);
    expect(order.user).toBeDefined();
    expect(order.products).toBeDefined();
    expect(order.products.length).toBe(1);
    expect(order.products[0].quantity).toBe(2);
    expect(order.products[0].price).toBe(50);
    expect(order.totalAmount).toBe(100);
  });

  it("should throw an error if user is missing", () => {
    const order = new Order({
      ...validOrderData,
      user: undefined,
    });
    const error = order.validateSync();
    expect(error.errors.user).toBeDefined();
  });

  it("should throw an error if totalAmount is missing", () => {
    const order = new Order({
      ...validOrderData,
      totalAmount: undefined,
    });
    const error = order.validateSync();
    expect(error.errors.totalAmount).toBeDefined();
  });

  it("should not allow negative totalAmount", () => {
    const order = new Order({
      ...validOrderData,
      totalAmount: -100,
    });
    const error = order.validateSync();
    expect(error.errors.totalAmount).toBeDefined();
  });

  it("should require at least one product in products array", () => {
    const order = new Order({
      ...validOrderData,
      products: [],
    });
    expect(order.products.length).toBe(0);
  });

  it("should validate product quantity is at least 1", () => {
    const order = new Order({
      ...validOrderData,
      products: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 0,
          price: 50,
        },
      ],
    });
    const error = order.validateSync();
    expect(error.errors["products.0.quantity"]).toBeDefined();
  });

  it("should allow stripeSessionId as optional field", () => {
    const order = new Order({
      ...validOrderData,
      stripeSessionId: "cs_test_123",
    });
    expect(order.stripeSessionId).toBe("cs_test_123");
  });
});
