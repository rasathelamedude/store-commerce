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
import jwt from "jsonwebtoken";
import {
  signUp,
  signIn,
  signOut,
  refreshToken,
  getProfile,
} from "../../../controllers/auth.controller.js";
import User from "../../../models/user.model.js";
import { redis } from "../../../lib/redis.js";
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from "../../../lib/env.js";

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
  await User.deleteMany({});
  jest.spyOn(jwt, "sign").mockReturnValue("mock_token");
  jest
    .spyOn(jwt, "verify")
    .mockReturnValue({ userId: new mongoose.Types.ObjectId() });
  jest.spyOn(redis, "set").mockResolvedValue("OK");
  jest.spyOn(redis, "get").mockResolvedValue(null);
  jest.spyOn(redis, "del").mockResolvedValue(1);
});

describe("Auth Controller", () => {
  const mockRes = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    return res;
  };

  const mockReq = (overrides = {}) => {
    return {
      body: {},
      cookies: {},
      user: null,
      ...overrides,
    };
  };

  describe("signUp", () => {
    it("should create a new user successfully", async () => {
      redis.set.mockResolvedValue("OK");

      const req = mockReq({
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        },
      });

      const res = mockRes();

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Signed up successfully",
        data: {
          user: expect.objectContaining({
            name: "John Doe",
            email: "john@example.com",
            role: "customer",
          }),
          token: expect.any(String),
        },
      });

      const savedUser = await User.findOne({ email: "john@example.com" });
      expect(savedUser).toBeTruthy();
      expect(redis.set).toHaveBeenCalled();
    });

    it("should return error if user already exists", async () => {
      await User.create({
        name: "Existing User",
        email: "existing@example.com",
        password: "password123",
      });

      const req = mockReq({
        body: {
          name: "New User",
          email: "existing@example.com",
          password: "newpass123",
        },
      });

      const res = mockRes();

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User already exists",
      });
    });

    it("should set authentication cookies", async () => {
      redis.set.mockResolvedValue("OK");

      const req = mockReq({
        body: {
          name: "Jane Doe",
          email: "jane@example.com",
          password: "securepass123",
        },
      });

      const res = mockRes();

      await signUp(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: "strict",
        }),
      );

      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: "strict",
        }),
      );
    });
  });

  describe("signIn", () => {
    it("should sign in user with correct credentials", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "correctpass123",
      });

      redis.set.mockResolvedValue("OK");

      const req = mockReq({
        body: {
          email: "test@example.com",
          password: "correctpass123",
        },
      });

      const res = mockRes();

      await signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged in successfully",
        data: {
          user: expect.objectContaining({
            email: "test@example.com",
            name: "Test User",
          }),
          token: expect.any(String),
        },
      });
    });

    it("should return error for non-existent user", async () => {
      const req = mockReq({
        body: {
          email: "nonexistent@example.com",
          password: "password123",
        },
      });

      const res = mockRes();

      await signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User doesn't exist!",
      });
    });

    it("should return error for incorrect password", async () => {
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "correctpass123",
      });

      const req = mockReq({
        body: {
          email: "test@example.com",
          password: "wrongpass123",
        },
      });

      const res = mockRes();

      await signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password is invalid!",
      });
    });
  });

  describe("signOut", () => {
    it("should clear cookies and remove refresh token", async () => {
      redis.del.mockResolvedValue(1);
      const mockUserId = new mongoose.Types.ObjectId();
      jwt.verify.mockReturnValue({ _id: mockUserId });

      const req = mockReq({
        cookies: {
          refreshToken: "valid_refresh_token",
        },
      });

      const res = mockRes();

      await signOut(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("accessToken");
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(redis.del).toHaveBeenCalledWith(`refresh_token: ${mockUserId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully!",
      });
    });

    it("should handle signout without refresh token", async () => {
      const req = mockReq({
        cookies: {},
      });

      const res = mockRes();

      await signOut(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("accessToken");
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("refreshToken", () => {
    it("should return error if no refresh token provided", async () => {
      const req = mockReq({
        cookies: {},
      });

      const res = mockRes();

      await refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No refresh token is provided",
      });
    });

    it("should return error if refresh token is invalid", async () => {
      redis.get.mockResolvedValue("different_token");
      const mockUserId = new mongoose.Types.ObjectId();
      jwt.verify.mockReturnValue({ userId: mockUserId });

      const req = mockReq({
        cookies: {
          refreshToken: "stored_token",
        },
      });

      const res = mockRes();

      await refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "refresh token is invalid",
      });
    });

    it("should create new access token with valid refresh token", async () => {
      const mockUserId = new mongoose.Types.ObjectId();
      jwt.verify.mockReturnValue({ userId: mockUserId });
      jwt.sign.mockReturnValue("new_access_token");
      redis.get.mockResolvedValue("stored_refresh_token");

      const req = mockReq({
        cookies: {
          refreshToken: "stored_refresh_token",
        },
      });

      const res = mockRes();

      await refreshToken(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        "new_access_token",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Access token refreshed successfully",
      });
    });
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: "Test User",
        email: "test@example.com",
        role: "customer",
      };

      const req = mockReq({
        user: mockUser,
      });

      const res = mockRes();

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Fetched user profile",
        data: {
          user: mockUser,
        },
      });
    });
  });
});
