import { describe, expect, it } from "bun:test";
import Elysia from "elysia";
import { nocache } from "src/config";

describe("Config: No cache testing", (): void => {
	it("should set header no cache", async (): Promise<void> => {
		const app = new Elysia().use(nocache).get("/", () => "Hello, World!");
		const res: Response = await app.handle(new Request("http://localhost/"));
		const headers: Headers = res.headers;

		expect(
			Bun.deepEquals(
				headers,
				new Headers({
					"Surrogate-Control": "no-store",
					"Cache-Control":
						"no-store, no-cache, must-revalidate, proxy-revalidate",
					Pragma: "no-cache",
					Expires: "0",
				}),
			),
		).toBe(true);
	});
});
