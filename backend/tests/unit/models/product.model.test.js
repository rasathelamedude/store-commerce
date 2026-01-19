import Product from "../../../models/product.model.js";

describe("Product Model", () => {
  const validProductData = {
    name: "Test Product",
    description: "A test product",
    price: 100,
    category: "Electronics",
  };

  it("should create a product with valid properties", () => {
    const product = new Product(validProductData);
    expect(product.name).toBe("Test Product");
    expect(product.description).toBe("A test product");
    expect(product.price).toBe(100);
    expect(product.category).toBe("Electronics");
    expect(product.isFeatured).toBe(false);
  });

  it("should throw an error if name is missing", () => {
    const product = new Product({
      ...validProductData,
      name: undefined,
    });
    const error = product.validateSync();
    expect(error.errors.name).toBeDefined();
  });

  it("should throw an error if description is missing", () => {
    const product = new Product({
      ...validProductData,
      description: undefined,
    });
    const error = product.validateSync();
    expect(error.errors.description).toBeDefined();
  });

  it("should throw an error if price is missing", () => {
    const product = new Product({
      ...validProductData,
      price: undefined,
    });
    const error = product.validateSync();
    expect(error.errors.price).toBeDefined();
  });

  it("should throw an error if category is missing", () => {
    const product = new Product({
      ...validProductData,
      category: undefined,
    });
    const error = product.validateSync();
    expect(error.errors.category).toBeDefined();
  });

  it("should throw an error if price is negative", () => {
    const product = new Product({
      ...validProductData,
      price: -10,
    });
    const error = product.validateSync();
    expect(error.errors.price).toBeDefined();
  });

  it("should allow price of 0", () => {
    const product = new Product({
      ...validProductData,
      price: 0,
    });
    const error = product.validateSync();
    expect(error).toBeUndefined();
  });

  it("should have isFeatured default to false", () => {
    const product = new Product(validProductData);
    expect(product.isFeatured).toBe(false);
  });

  it("should allow image as optional field", () => {
    const product = new Product({
      ...validProductData,
      image: "https://example.com/image.jpg",
    });
    expect(product.image).toBe("https://example.com/image.jpg");
  });

  it("should trim description whitespace", () => {
    const product = new Product({
      ...validProductData,
      description: "  A test product  ",
    });
    expect(product.description).toBe("A test product");
  });
});
