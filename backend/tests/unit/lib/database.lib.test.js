import { describe, it, expect } from "@jest/globals";
import { connectToDatabase } from "../../../lib/database.js";

describe("Database Library", () => {
  it("should export connectToDatabase function", () => {
    expect(typeof connectToDatabase).toBe("function");
  });

  it("connectToDatabase should be an async function", async () => {
    const result = connectToDatabase();
    expect(result).toBeInstanceOf(Promise);
  });
});
