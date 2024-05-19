import { describe, expect, it } from "bun:test";
import { forwardInSeconds } from "src/util/date";

describe("Util: Date testing", (): void => {
	it("forwardInSeconds: should add seconds to a date", (): void => {
		const fromDate: Date = new Date("2021-01-01");
		const seconds: number = 60;
		const resultDate: Date = forwardInSeconds(seconds, fromDate);
		expect(resultDate).toEqual(new Date("2021-01-01T00:01:00.000Z"));
	});
});
