import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import {
  protectRoute,
  adminRoute,
} from "../../../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";

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

      await protectRoute(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
      });
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
