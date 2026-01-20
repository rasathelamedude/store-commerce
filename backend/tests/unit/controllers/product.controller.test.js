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
import Product from "../../../models/product.model.js";
import {
  getAllProducts,
  createProducts,
  deleteProduct,
  getFeaturedProducts,
} from "../../../controllers/product.controller.js";
import cloudinary from "../../../lib/cloudinary.js";
import { redis } from "../../../lib/redis.js";

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
  jest.spyOn(redis, "get").mockResolvedValue(null);
  jest.spyOn(redis, "set").mockResolvedValue("OK");
  jest
    .spyOn(cloudinary.uploader, "upload")
    .mockResolvedValue({ secure_url: "https://example.com/image.jpg" });
  jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({});
});

describe("Product Controller", () => {
  const mockRes = (statusCode = 200) => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    return res;
  };

  const mockReq = (overrides = {}) => {
    return {
      body: {},
      params: {},
      ...overrides,
    };
  };

  describe("getAllProducts", () => {
    it("should return all products", async () => {
      const products = await Product.create([
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

      await getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched all the products",
        data: {
          products: expect.arrayContaining([
            expect.objectContaining({
              name: "Product 1",
              price: 100,
            }),
            expect.objectContaining({
              name: "Product 2",
              price: 200,
            }),
          ]),
        },
      });
    });

    it("should return empty array when no products exist", async () => {
      const req = mockReq();
      const res = mockRes();

      await getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched all the products",
        data: {
          products: [],
        },
      });
    });
  });

  describe("getFeaturedProducts", () => {
    it("should return featured products from cache if available", async () => {
      const product = await Product.create({
        name: "Featured 1",
        description: "Desc",
        price: 100,
        category: "Electronics",
        isFeatured: true,
      });

      const req = mockReq();
      const res = mockRes();

      await getFeaturedProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0]).toMatchObject({
        success: true,
        message: "Fetched featured products",
        result: 1,
      });
    });

    it("should fetch featured products from database and cache if not in cache", async () => {
      const product = await Product.create({
        name: "Featured Product",
        description: "Featured desc",
        price: 150,
        category: "Electronics",
        isFeatured: true,
      });

      redis.get.mockResolvedValue(null);
      redis.set.mockResolvedValue("OK");

      const req = mockReq();
      const res = mockRes();

      await getFeaturedProducts(req, res);

      expect(redis.get).toHaveBeenCalledWith("featured_products");
      expect(redis.set).toHaveBeenCalledWith(
        "featured_products",
        expect.stringContaining("Featured Product"),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched featured products",
        result: 1,
        data: {
          featuredProducts: expect.arrayContaining([
            expect.objectContaining({
              name: "Featured Product",
            }),
          ]),
        },
      });
    });

    it("should return empty list when no featured products exist", async () => {
      redis.get.mockResolvedValue(null);
      redis.set.mockResolvedValue("OK");

      const req = mockReq();
      const res = mockRes();

      await getFeaturedProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched featured products",
        result: 0,
        data: {
          featuredProducts: [],
        },
      });
    });
  });

  describe("createProducts", () => {
    it("should create a product without image", async () => {
      const req = mockReq({
        body: {
          name: "New Product",
          description: "New desc",
          price: 99.99,
          category: "Clothing",
        },
      });

      const res = mockRes();

      await createProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Product created successfully",
        data: {
          product: expect.objectContaining({
            name: "New Product",
            description: "New desc",
            price: 99.99,
            category: "Clothing",
            image: null,
          }),
        },
      });

      const savedProduct = await Product.findOne({ name: "New Product" });
      expect(savedProduct).toBeTruthy();
    });

    it("should create a product with cloudinary image upload", async () => {
      cloudinary.uploader.upload.mockResolvedValue({
        secure_url: "https://example.com/image.jpg",
      });

      const req = mockReq({
        body: {
          name: "Product with Image",
          description: "Desc with image",
          price: 199.99,
          category: "Electronics",
          image: "data:image/jpeg;base64,...",
        },
      });

      const res = mockRes();

      await createProducts(req, res);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        "data:image/jpeg;base64,...",
        {
          folder: "products",
        },
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Product created successfully",
        data: {
          product: expect.objectContaining({
            name: "Product with Image",
            image: "https://example.com/image.jpg",
          }),
        },
      });
    });

    it("should return error if creation fails", async () => {
      const req = mockReq({
        body: {
          name: "Invalid Product",
          description: "", // Missing required description
          price: -10, // Invalid price
          category: "Electronics",
        },
      });

      const res = mockRes();

      await createProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
      });
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product successfully", async () => {
      const product = await Product.create({
        name: "Product to Delete",
        description: "Will be deleted",
        price: 50,
        category: "Books",
      });

      const req = mockReq({
        params: {
          productId: product._id,
        },
      });

      const res = mockRes();

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Product deleted successfully",
      });

      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it("should delete cloudinary image if product has one", async () => {
      const product = await Product.create({
        name: "Product with Image",
        description: "Has image",
        price: 75,
        category: "Electronics",
        image: "https://cloudinary.com/products/image123.jpg",
      });

      cloudinary.uploader.destroy.mockResolvedValue({});

      const req = mockReq({
        params: {
          productId: product._id,
        },
      });

      const res = mockRes();

      await deleteProduct(req, res);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        "products/image123",
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if product not found", async () => {
      const req = mockReq({
        params: {
          productId: new mongoose.Types.ObjectId(),
        },
      });

      const res = mockRes();

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Product not found",
      });
    });
  });
});
