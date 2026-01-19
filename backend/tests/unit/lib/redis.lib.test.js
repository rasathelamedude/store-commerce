import { describe, it, expect } from "@jest/globals";
import { redis } from "../../../lib/redis.js";

describe("Redis Library", () => {
  it("should have redis object defined", () => {
    expect(redis).toBeDefined();
  });

  it("should have redis methods available", () => {
    expect(typeof redis.get).toBe("function");
    expect(typeof redis.set).toBe("function");
    expect(typeof redis.del).toBe("function");
  });
});
