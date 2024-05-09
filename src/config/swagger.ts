import { swagger } from "@elysiajs/swagger";
import type { Elysia } from "elysia";
import { swaggerOptions, versionOptions } from "src/common";
import { env } from "src/config/env";

export const swaggerConfig = () => (app: Elysia) => {
	if (env.enbSwaggerUi) {
		return app.use(
			swagger({
				documentation: {
					info: { ...swaggerOptions.info, version: versionOptions.version },
					servers: [
						{
							url: `http://localhost:${env.appPort}`,
							description: "Local server",
						},
					],
					tags: Object.values(swaggerOptions.tags),
				},
				version: versionOptions.version,
				provider: "scalar",
				scalarConfig: { theme: "solarized" },
				path: env.swaggerUiPath,
			}),
		);
	}
	return app;
};
