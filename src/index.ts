import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import { DEFAULT_APP_LANGUAGE, HEADER_KEY } from "src/common";
import {
	connectRedis,
	env,
	httpError,
	httpResponse,
	i18next,
	requestHeader,
	swaggerConfig,
} from "src/config";
import { authRoutes, userRoutes } from "src/router";
import { fixCtxRequest, gracefulShutdown } from "src/util";

try {
	await connectRedis();
	const app = new Elysia()
		.derive((ctx) => fixCtxRequest(ctx.request))
		.use(serverTiming())
		.use(
			cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }),
		)
		.use(swaggerConfig())
		.use(logger({ level: "info", autoLogging: true }))
		.use(
			requestHeader({
				ip: true,
				timezone: true,
				timestamp: true,
				customLanguage: true,
				id: true,
				version: true,
				repoVersion: true,
			}),
		)
		.use(compression())
		.use(httpError())
		.use(httpResponse())
		.use(
			i18next({
				detectLanguage: (ctx) =>
					ctx.headers[HEADER_KEY.X_CUSTOM_LANGUAGE] ?? DEFAULT_APP_LANGUAGE,
				initOptions: {
					lng: "nl",
					resources: {
						en: {
							translation: {
								greeting: "Hi",
							},
						},
						nl: {
							translation: {
								greeting: "Hallo",
							},
						},
					},
				},
			}),
		)
		// .get("/", ({ t }) => t("greeting")) // returns "Hallo"
		.onStop(gracefulShutdown)
		.use(authRoutes)
		.use(userRoutes);
	process.on("SIGINT", app.stop);
	process.on("SIGTERM", app.stop);
	app.listen(env.PORT);

	console.log(
		`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
	);
} catch (e) {
	console.log("error booting the server");
	console.error(e);
}
