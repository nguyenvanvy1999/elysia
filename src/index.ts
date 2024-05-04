import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import {
	connectRedis,
	env,
	httpError,
	httpResponse,
	requestHeader,
	swaggerConfig,
} from "src/config";
import { authRoutes, userRoutes } from "src/router";
import { bootLogger, fixCtxRequest, gracefulShutdown } from "src/util";

try {
	await connectRedis();
	const app = new Elysia()
		.derive((ctx) => fixCtxRequest(ctx.request))
		.use(
			cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }),
		)
		.use(swaggerConfig())
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
		.onStop(gracefulShutdown)
		.use(authRoutes)
		.use(userRoutes);
	process.on("SIGINT", app.stop);
	process.on("SIGTERM", app.stop);
	app.listen(env.PORT);

	bootLogger();
} catch (e) {
	console.log("error booting the server");
	console.error(e);
}
