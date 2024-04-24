import { describe, expect, it } from "bun:test";
import { NANO_ID_LENGTH } from "src/common";
import { dbIdGenerator } from "src/util";

describe("Util: DbIdGenerator testing", () => {
	it("Should generate random id with prefix", () => {
		const prefix: string = "prefix";
		const result: string = dbIdGenerator(prefix);
		expect(result).toHaveLength(prefix.length + 1 + NANO_ID_LENGTH);
		expect(result.startsWith(`${prefix}_`)).toEqual(true);
	});

	it("Should generate random id if not pass prefix", () => {
		const result: string = dbIdGenerator();
		expect(result).toHaveLength(NANO_ID_LENGTH);
	});
});
