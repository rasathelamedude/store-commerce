import {
  protectRoute,
  adminRoute,
} from "../../../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";
import User from "../../../models/user.model.js";

// Fake the imports
jest.mock("jsonwebtoken");
jest.mock("../../../models/user.model.js");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("protectRoute", () => {
    it("should return 401 if no access token is provided", async () => {
      req.cookies = {};

      await protectRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized",
      });
    });

    it("should return 401 if token verification fails", async () => {
      req.cookies.accessToken = "invalid_token";
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await protectRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid token",
      });
    });

    it("should return 401 if user is not found", async () => {
      req.cookies.accessToken = "valid_token";
      jwt.verify.mockReturnValue({ userId: "123" });
      User.findById.mockResolvedValue(null);

      await protectRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found!",
      });
    });

    it("should set req.user and call next if token is valid", async () => {
      const mockUser = { _id: "123", name: "Test User" };
      req.cookies.accessToken = "valid_token";
      jwt.verify.mockReturnValue({ userId: "123" });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await protectRoute(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("adminRoute", () => {
    it("should return 403 if user is not admin", async () => {
      req.user = { role: "customer" };

      await adminRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied - Admin only",
      });
    });

    it("should return 403 if user is not set", async () => {
      req.user = null;

      await adminRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied - Admin only",
      });
    });

    it("should call next if user is admin", async () => {
      req.user = { role: "admin" };

      await adminRoute(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
