import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";

describe("Elysia", (): void => {
	it("return a response", async (): Promise<void> => {
		const app = new Elysia().get("/", () => "hi");

		const response = await app
			.handle(new Request("http://localhost/"))
			.then((res) => res.text());

		expect(response).toBe("hi");
	});
});
