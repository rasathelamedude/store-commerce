import User from "../../../models/user.model.js";

describe("User Model", () => {
  const validUserData = {
    name: "Test User",
    email: "testuser@example.com",
    password: "password123",
  };

  it("should create a user with valid properties", () => {
    const user = new User(validUserData);
    expect(user.name).toBe("Test User");
    expect(user.email).toBe("testuser@example.com");
    expect(user.password).toBe("password123");
    expect(user.role).toBe("customer");
    expect(user.cartItems).toEqual([]);
  });

  it("should throw an error if name is missing", () => {
    const user = new User({
      ...validUserData,
      name: undefined,
    });
    const error = user.validateSync();
    expect(error.errors.name).toBeDefined();
  });

  it("should throw an error if email is missing", () => {
    const user = new User({
      ...validUserData,
      email: undefined,
    });
    const error = user.validateSync();
    expect(error.errors.email).toBeDefined();
  });

  it("should throw an error if password is missing", () => {
    const user = new User({
      ...validUserData,
      password: undefined,
    });
    const error = user.validateSync();
    expect(error.errors.password).toBeDefined();
  });

  it("should throw an error if password is less than 6 characters", () => {
    const user = new User({
      ...validUserData,
      password: "12345",
    });
    const error = user.validateSync();
    expect(error.errors.password).toBeDefined();
  });

  it("should have default role of customer", () => {
    const user = new User(validUserData);
    expect(user.role).toBe("customer");
  });

  it("should allow admin role", () => {
    const user = new User({
      ...validUserData,
      role: "admin",
    });
    expect(user.role).toBe("admin");
  });

  it("should have empty cartItems by default", () => {
    const user = new User(validUserData);
    expect(user.cartItems).toEqual([]);
  });

  it("should allow cartItems array with product references", () => {
    const user = new User({
      ...validUserData,
      cartItems: [
        {
          quantity: 2,
          product: "507f1f77bcf86cd799439011",
        },
      ],
    });
    expect(user.cartItems.length).toBe(1);
    expect(user.cartItems[0].quantity).toBe(2);
  });

  it("should have comparePassword method", () => {
    const user = new User(validUserData);
    expect(typeof user.comparePassword).toBe("function");
  });

  it("should lowercase and trim email", () => {
    const user = new User({
      ...validUserData,
      email: "  TestUser@Example.COM  ",
    });
    expect(user.email).toBe("testuser@example.com");
  });
});
