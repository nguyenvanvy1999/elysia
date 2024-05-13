import { describe, expect, it } from "bun:test";
import { checkNumber } from "src/util";

describe("Util: Validate", () => {
	const mockNumber = "1234";

	describe("checkNumber", () => {
		it("should return true when given a valid number", () => {
			expect(checkNumber(mockNumber)).toBe(true);
		});

		it("should return false when given an invalid number", () => {
			expect(checkNumber("not a number")).toBe(false);
		});
	});
	//todo: add test for check json
});
