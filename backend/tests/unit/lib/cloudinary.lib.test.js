import { describe, it, expect } from "@jest/globals";
import cloudinary from "../../../lib/cloudinary.js";

describe("Cloudinary Library", () => {
  it("should export a cloudinary instance", () => {
    expect(cloudinary).toBeDefined();
  });

  it("should have cloudinary uploader methods available", () => {
    expect(typeof cloudinary.uploader).toBe("object");
    expect(typeof cloudinary.uploader.upload).toBe("function");
    expect(typeof cloudinary.uploader.destroy).toBe("function");
  });
});
