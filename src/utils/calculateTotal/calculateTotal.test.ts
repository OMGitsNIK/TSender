import { describe, it, expect } from "vitest";
import { calculateTotal } from "./calculateTotal";

describe("calculateTotal", () => {
  it("sums valid numbers", () => {
    expect(calculateTotal("100,200,300")).toBe(600);
  });

  it("handles whitespace", () => {
    expect(calculateTotal("100, 200, 300")).toBe(600);
  });

  it("handles empty string", () => {
    expect(calculateTotal("")).toBe(0);
  });

  it("handles invalid inputs", () => {
    expect(calculateTotal("abc,100,def")).toBe(100);
  });

  it("handles trailing comma", () => {
    expect(calculateTotal("100,200,")).toBe(300);
  });

  // ✅ Additional test cases:

  it("handles newline-separated values", () => {
    expect(calculateTotal("100\n200\n300")).toBe(600);
  });

  it("handles mixed commas and newlines", () => {
    expect(calculateTotal("100,200\n300")).toBe(600);
  });

  it("handles multiple delimiters and whitespace", () => {
    expect(calculateTotal(" 100 , \n200 ,\n 300 ")).toBe(600);
  });

  it("ignores completely non-numeric input", () => {
    expect(calculateTotal("abc,def,ghi")).toBe(0);
  });

  it("parses floating point numbers", () => {
    expect(calculateTotal("10.5,20.25")).toBeCloseTo(30.75, 2);
  });

  it("handles leading and trailing newlines", () => {
    expect(calculateTotal("\n100,200\n")).toBe(300);
  });

  it("handles very large numbers", () => {
    expect(calculateTotal("1000000000,2000000000")).toBe(3000000000);
  });

  it("handles scientific notation", () => {
    expect(calculateTotal("1e3,2e3")).toBe(3000);
  });

  it("handles negative numbers", () => {
    expect(calculateTotal("-100,200")).toBe(100);
  });
});
