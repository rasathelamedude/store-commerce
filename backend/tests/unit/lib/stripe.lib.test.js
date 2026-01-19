import { describe, it, expect } from "@jest/globals";
import { stripe } from "../../../lib/stripe.js";

describe("Stripe Library", () => {
  it("should have stripe object defined", () => {
    expect(stripe).toBeDefined();
  });

  it("should have stripe charges methods available", () => {
    expect(typeof stripe.charges).toBe("object");
    expect(typeof stripe.charges.create).toBe("function");
  });

  it("should have stripe customers methods available", () => {
    expect(typeof stripe.customers).toBe("object");
    expect(typeof stripe.customers.create).toBe("function");
  });

  it("should have stripe checkout methods available", () => {
    expect(typeof stripe.checkout).toBe("object");
    expect(typeof stripe.checkout.sessions).toBe("object");
    expect(typeof stripe.checkout.sessions.create).toBe("function");
  });
});
