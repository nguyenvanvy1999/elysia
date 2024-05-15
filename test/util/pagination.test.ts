import { describe, expect, it } from "bun:test";
import { DEFAULT, PAGING_MAX_LIMIT } from "src/common";
import { getLimit, getOffset } from "src/util";

describe("Util: Pagination testing", (): void => {
	describe("getOffset", (): void => {
		it("Should return default offset when not have", (): void => {
			expect(getOffset(undefined)).toEqual(DEFAULT.PAGING_OFFSET);
		});

		it("Should return offset when have", (): void => {
			expect(getOffset(2)).toEqual(2);
		});

		it("Should return 0 when offset negative", (): void => {
			expect(getOffset(-1)).toEqual(0);
		});
	});

	describe("getLimit", (): void => {
		it("Should return default limit when not have", (): void => {
			expect(getLimit(undefined)).toEqual(DEFAULT.PAGING_LIMIT);
		});

		it("Should return limit when have", (): void => {
			expect(getLimit(2)).toEqual(2);
		});

		it("Should return default when limit negative", (): void => {
			expect(getLimit(-1)).toEqual(DEFAULT.PAGING_LIMIT);
		});

		it("Should return max limit when it over max limit", (): void => {
			expect(getLimit(201)).toEqual(PAGING_MAX_LIMIT);
		});
	});
});
