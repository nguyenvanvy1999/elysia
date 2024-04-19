import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { html } from "@elysiajs/html";
import { serverTiming } from "@elysiajs/server-timing";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import { helmet } from "elysia-helmet";
import { i18next } from "elysia-i18next";
import { rateLimit } from "elysia-rate-limit";
import { requestID } from "elysia-requestid";
import { ip } from "lib/ip";

const app = new Elysia()
	.use(serverTiming())
	.use(cors())
	.use(swagger())
	.use(helmet())
	.use(rateLimit())
	.use(staticPlugin())
	.use(logger({ level: "info", autoLogging: true }))
	.use(requestID())
	.use(ip())
	.use(html())
	.use(compression())
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
	.get("/", ({ ip }): void => {
		throw { message: "1234", name: "MyError", ip };
	})
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
