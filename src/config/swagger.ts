import { swagger } from "@elysiajs/swagger";
import type { Elysia } from "elysia";
import { swaggerOptions, versionOptions } from "src/common";
import { config } from "src/config/env";

export const swaggerConfig = () => (app: Elysia) => {
	if (config.enbSwaggerUi) {
		return app.use(
			swagger({
				documentation: {
					info: { ...swaggerOptions.info, version: versionOptions.version },
					servers: [
						{
							url: `http://localhost:${config.appPort}`,
							description: "Local server",
						},
					],
					tags: Object.values(swaggerOptions.tags),
				},
				version: versionOptions.version,
				provider: "scalar",
				scalarConfig: { theme: "solarized" },
				path: config.swaggerUiPath,
			}),
		);
	}
	return app;
};
