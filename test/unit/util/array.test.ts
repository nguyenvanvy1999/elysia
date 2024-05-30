import { describe, expect, it } from "bun:test";
import { uniqueArr } from "src/util";

describe("Util: Array testing", (): void => {
	it("uniqueArr: string array have duplicate", (): void => {
		const arr: string[] = ["1", "2", "3", "4", "1", "2"];
		const rs: string[] = uniqueArr(arr);
		expect(rs).toEqual(["1", "2", "3", "4"]);
	});

	it("uniqueArr: string array haven't duplicate", (): void => {
		const arr: string[] = ["1", "2", "3", "4"];
		const rs: string[] = uniqueArr(arr);
		expect(rs).toEqual(["1", "2", "3", "4"]);
	});

	it("uniqueArr: number array have duplicate", (): void => {
		const arr: number[] = [1, 2, 3, 4, 1, 2];
		const rs: number[] = uniqueArr(arr);
		expect(rs).toEqual([1, 2, 3, 4]);
	});

	it("uniqueArr: number array haven't duplicate", (): void => {
		const arr: number[] = [1, 2, 3, 4];
		const rs: number[] = uniqueArr(arr);
		expect(rs).toEqual([1, 2, 3, 4]);
	});
});
