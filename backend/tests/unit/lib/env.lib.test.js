import { describe, it, expect } from "@jest/globals";
import {
  PORT,
  DB_CONNECTION_URI,
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
  REDIS_URI,
  NODE_ENV,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
  CLIENT_URL,
} from "../../../lib/env.js";

describe("Environment Library", () => {
  it("should export PORT from environment variables", () => {
    expect(PORT).toBeDefined();
  });

  it("should export DB_CONNECTION_URI from environment variables", () => {
    expect(DB_CONNECTION_URI).toBeDefined();
  });

  it("should export ACCESS_SECRET_KEY from environment variables", () => {
    expect(ACCESS_SECRET_KEY).toBeDefined();
  });

  it("should export REFRESH_SECRET_KEY from environment variables", () => {
    expect(REFRESH_SECRET_KEY).toBeDefined();
  });

  it("should export REDIS_URI from environment variables", () => {
    expect(REDIS_URI).toBeDefined();
  });

  it("should export NODE_ENV from environment variables", () => {
    expect(NODE_ENV).toBeDefined();
  });

  it("should export CLOUDINARY_CLOUD_NAME from environment variables", () => {
    expect(CLOUDINARY_CLOUD_NAME).toBeDefined();
  });

  it("should export CLOUDINARY_API_KEY from environment variables", () => {
    expect(CLOUDINARY_API_KEY).toBeDefined();
  });

  it("should export CLOUDINARY_API_SECRET from environment variables", () => {
    expect(CLOUDINARY_API_SECRET).toBeDefined();
  });

  it("should export STRIPE_PUBLISHABLE_KEY from environment variables", () => {
    expect(STRIPE_PUBLISHABLE_KEY).toBeDefined();
  });

  it("should export STRIPE_SECRET_KEY from environment variables", () => {
    expect(STRIPE_SECRET_KEY).toBeDefined();
  });

  it("should export CLIENT_URL from environment variables", () => {
    expect(CLIENT_URL).toBeDefined();
  });
});
