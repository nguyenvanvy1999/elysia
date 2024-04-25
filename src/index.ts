import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import { i18next } from "elysia-i18next";
import {
	connectRedis,
	env,
	httpError,
	httpResponse,
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
		.use(requestHeader())
		.use(compression())
		.use(httpError())
		.use(httpResponse())
		.use(
			i18next({
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
