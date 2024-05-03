import { describe, expect, it } from "bun:test";
import { NANO_ID_LENGTH } from "src/common";
import { dbIdGenerator } from "src/util";

describe("Util: DbIdGenerator testing", (): void => {
	it("Should generate random id with prefix", (): void => {
		const prefix: string = "prefix";
		const result: string = dbIdGenerator(prefix);
		expect(result).toHaveLength(prefix.length + 1 + NANO_ID_LENGTH);
		expect(result.startsWith(`${prefix}_`)).toEqual(true);
	});

	it("Should generate random id if not pass prefix", (): void => {
		const result: string = dbIdGenerator();
		expect(result).toHaveLength(NANO_ID_LENGTH);
	});

	it("Should generate random id with length", (): void => {
		const idLength: number = 10;
		const result: string = dbIdGenerator("", idLength);
		expect(result).toHaveLength(idLength);
	});

	it("Should generate random id with length and prefix config", (): void => {
		const idLength: number = 10;
		const prefix: string = "prefix";
		const result: string = dbIdGenerator(prefix, idLength);
		expect(result).toHaveLength(prefix.length + 1 + idLength);
		expect(result.startsWith(`${prefix}_`)).toEqual(true);
	});
});
