import { describe, expect, it } from "bun:test";
import { edenTreaty } from "@elysiajs/eden";
import { Elysia } from "elysia";
import { headersToCheck, ip } from "src/config";

describe("Config: IP testing", (): void => {
	it("Default setting : Should return an local IP", async (): Promise<void> => {
		const app = new Elysia()
			.use(ip())
			.get("/", ({ ip }) => ip)
			.listen(2999);
		const api = edenTreaty<typeof app>("http://localhost:2999");
		const { data } = await api.index.get();
		if (typeof data !== "string") {
			expect(data?.address).toBe("::1");
			expect(data?.family).toBe("IPv6");
			expect(data?.port).toBeNumber();
		}
		await app.stop();
	});

	describe.each([
		...headersToCheck.map((x, index) => ({
			headerName: x,
			ipAddress: `34.204.139.${index}`,
			port: Number.parseInt(index < 10 ? `300${index}` : `30${index}`, 10),
		})),
		{
			headerName: "custom-header",
			ipAddress: "34.204.139.12",
			port: 3012,
		},
	])(
		"Set check headers values and headersOnly true",
		async ({ headerName, port, ipAddress }): Promise<void> => {
			it(`${headerName} : Should return an IP`, async (): Promise<void> => {
				const app = new Elysia()
					.use(ip({ checkHeaders: [headerName], headersOnly: true }))
					.get("/", ({ ip }) => ip)
					.listen(port);
				const api = edenTreaty<typeof app>(`http://localhost:${port}`);
				const { data } = await api.index.get({
					$headers: { [headerName]: ipAddress },
				});
				expect(typeof data).toBe("string");
				expect(data).toBe(ipAddress);
				await app.stop();
			});
		},
	);

	it("Set check headers values and headersOnly false : Should return an local IP", async (): Promise<void> => {
		const customHeader: string = "customHeader";
		const app = new Elysia()
			.use(ip({ checkHeaders: [customHeader], headersOnly: false }))
			.get("/", ({ ip }) => ip)
			.listen(2998);
		const api = edenTreaty<typeof app>("http://localhost:2998");
		const { data } = await api.index.get({
			$headers: { [customHeader]: "34.204.139.0" },
		});
		if (typeof data !== "string") {
			expect(data?.address).toBe("::1");
			expect(data?.family).toBe("IPv6");
			expect(data?.port).toBeNumber();
		}
		await app.stop();
	});
});
