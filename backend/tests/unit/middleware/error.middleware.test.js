import errorMiddleware from "../../../middleware/error.middleware.js";

describe("Error Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle CastError (invalid MongoDB ID)", () => {
    const err = new Error("Invalid ID");
    err.name = "CastError";

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Resource not found!",
    });
  });

  it("should handle duplicate key error", () => {
    const err = new Error("Duplicate entry");
    err.code = 11000;

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Duplicate field value entered!",
    });
  });

  it("should handle validation error", () => {
    const err = new Error("Validation failed");
    err.name = "ValidationError";
    err.errors = {
      field1: { message: "Field 1 is required" },
      field2: { message: "Field 2 is invalid" },
    };

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Field 1 is required, Field 2 is invalid",
    });
  });

  it("should return 500 for generic errors without statusCode", () => {
    const err = new Error("Generic error");

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Generic error",
    });
  });

  it("should handle error with custom statusCode", () => {
    const err = new Error("Custom error");
    err.statusCode = 422;

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Custom error",
    });
  });

  it("should handle errors with no message", () => {
    const err = new Error();
    err.statusCode = 500;

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Server Error",
    });
  });
});
