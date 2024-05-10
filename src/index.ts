import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import { APP_ENV } from "src/common";
import {
	connectKafka,
	connectRedis,
	env,
	httpError,
	httpResponse,
	logger,
	requestHeader,
	swaggerConfig,
} from "src/config";
import { maintenance } from "src/config/maintenace";
import { authRoutes, userRoutes } from "src/router";
import { bootLogger, gracefulShutdown } from "src/util";

try {
	const allowOrigin: string =
		env.appEnv === APP_ENV.PRODUCTION ? env.cors.allowOrigin : "*";
	await connectRedis();
	await connectKafka();
	const app = new Elysia({ prefix: env.apiPrefix })
		.use(logger.into({ autoLogging: true }))
		.use(
			cors({
				origin: allowOrigin,
				methods: env.cors.allowMethod,
				allowedHeaders: env.cors.allowHeader,
				preflight: false,
			}),
		)
		.use(maintenance)
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
		.use(httpError())
		.use(httpResponse())
		.use(swaggerConfig())
		.use(compression())
		.onStop(gracefulShutdown)
		.use(authRoutes)
		.use(userRoutes);
	process.on("SIGINT", app.stop);
	process.on("SIGTERM", app.stop);
	app.listen({ port: env.appPort, maxRequestBodySize: 1_000_000_000 });

	bootLogger();
} catch (e) {
	logger.error(e, "Error booting the server");
}
