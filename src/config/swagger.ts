import { randomUUID } from "node:crypto";
import { basicAuth } from "@eelkevdbos/elysia-basic-auth";
import { swagger } from "@elysiajs/swagger";
import type { Elysia } from "elysia";
import { config } from "src/config/config";
import { env } from "src/config/env";

export const swaggerConfig = () => (app: Elysia) => {
	if (config.swagger.enable) {
		return app
			.use(
				swagger({
					documentation: {
						info: { ...config.swagger.info, version: config.version },
						servers: [
							{
								url: `http://localhost:${env.PORT}`,
								description: "Local server",
							},
						],
						tags: [
							{ name: "App", description: "General endpoints" },
							{ name: "Auth", description: "Authentication endpoints" },
						],
					},
					version: config.version,
					provider: "scalar",
					scalarConfig: { theme: "solarized" },
					path: config.swagger.path,
				}),
			)
			.use(
				basicAuth({
					scope: config.swagger.path,
					credentials: [{ username: "root", password: "root" }],
				}),
			);
	}
	return app;
};
