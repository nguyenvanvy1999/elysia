import { describe, expect, it } from "bun:test";
import Elysia from "elysia";
import { requestID } from "lib/request-id";

describe("Lib: Request ID testing", (): void => {
	it("sets a new request ID header when one isn't set", async (): Promise<void> => {
		const response = await new Elysia()
			.use(requestID({ uuid: () => "some-uuid" }))
			.get("/", () => "dummy")
			.handle(new Request("https://dummy.com/"));

		expect(response.headers.get("X-Request-ID")).toBe("some-uuid");
	});

	it("forwards the request ID header when it is available", async (): Promise<void> => {
		const response = await new Elysia()
			.use(requestID({ uuid: () => "some-uuid" }))
			.get("/", () => "dummy")
			.handle(
				new Request("https://dummy.com/", {
					headers: { "X-Request-ID": "existing-uuid" },
				}),
			);

		expect(response.headers.get("X-Request-ID")).toBe("existing-uuid");
	});

	it("allows the request ID header to be configured", async (): Promise<void> => {
		const response = await new Elysia()
			.use(
				requestID({ uuid: () => "some-uuid", header: "X-Custom-Request-ID" }),
			)
			.get("/", () => "dummy")
			.handle(new Request("https://dummy.com/"));

		expect(response.headers.get("X-Custom-Request-ID")).toBe("some-uuid");
	});

	it("forwards custom request ID when it is available", async (): Promise<void> => {
		const response = await new Elysia()
			.use(
				requestID({ uuid: () => "some-uuid", header: "X-Custom-Request-ID" }),
			)
			.get("/", () => "dummy")
			.handle(
				new Request("https://dummy.com/", {
					headers: { "X-Custom-Request-ID": "existing-uuid" },
				}),
			);

		expect(response.headers.get("X-Custom-Request-ID")).toBe("existing-uuid");
	});

	it("provides an accessor to the request ID", async (): Promise<void> => {
		const response = await new Elysia()
			.use(requestID({ uuid: () => "some-uuid" }))
			.get("/", ({ requestID }) => `ID: ${requestID}`)
			.handle(new Request("https://dummy.com/"));

		expect(await response.text()).toBe("ID: some-uuid");
	});
});
