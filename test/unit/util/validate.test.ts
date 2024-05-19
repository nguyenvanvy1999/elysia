import { describe, expect, it } from "bun:test";
import { checkJSONString, checkNumber } from "src/util";

describe("Util: Validate", () => {
	describe("checkNumber", () => {
		it("should return true when given a valid number", () => {
			expect(checkNumber("1234")).toBe(true);
		});

		it("should return false when given an invalid number", () => {
			expect(checkNumber("not a number")).toBe(false);
		});

		it("should return true when given float number", () => {
			expect(checkNumber("123.2")).toBe(true);
			expect(checkNumber("123,2")).toBe(true);
		});
	});

	describe("checkJSONString", () => {
		it("should return true when given a valid JSON", () => {
			expect(checkJSONString(JSON.stringify({ test: 1 }))).toBe(true);
		});

		it("should return false when given valid JSON", () => {
			expect(checkJSONString("not a number")).toBe(false);
		});
	});
});
