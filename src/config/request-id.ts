import { randomUUID } from "node:crypto";
import type { Elysia } from "elysia";

type Options = {
	uuid?: () => string;
	header?: string;
};

export const requestID =
	({ uuid = randomUUID, header = "X-Request-ID" }: Readonly<Options> = {}) =>
	(app: Elysia) => {
		return app
			.on("request", ({ set, request: { headers } }) => {
				set.headers[header] = headers.get(header) || uuid();
			})
			.derive(({ request, set }) => {
				return {
					requestID: set.headers[header],
				};
			});
	};
