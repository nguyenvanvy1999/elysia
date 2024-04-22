import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import { i18next } from "elysia-i18next";
import { httpError, httpErrorDecorator } from "lib/http-error";
import { requestID } from "lib/request-id";
import { env, swaggerConfig } from "src/config";
import { authRoutes } from "src/router";
import { fixCtxRequest } from "src/util";

const app = new Elysia()
	.derive((ctx) => fixCtxRequest(ctx.request))
	.use(serverTiming())
	.use(
		cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }),
	)
	.use(swaggerConfig())
	.use(logger({ level: "info", autoLogging: true }))
	.use(requestID())
	.use(compression())
	.use(httpErrorDecorator)
	.use(httpError())
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
	.use(authRoutes)
	.listen(env.PORT);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
