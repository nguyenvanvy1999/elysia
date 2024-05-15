import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import { APP_ENV } from "src/common";
import {
	config,
	connectKafka,
	connectRedis,
	httpError,
	httpResponse,
	logger,
	requestHeader,
	swaggerConfig,
} from "src/config";
import { maintenance } from "src/config/maintenace";
import { ensureSettings } from "src/config/setting";
import { authRoutes, settingRoutes, userRoutes } from "src/router";
import { bootLogger, gracefulShutdown } from "src/util";

try {
	await ensureSettings();
} catch (e: any) {
	console.error(`Error when start server: ${e?.message}`);
	process.exit();
}

try {
	await connectRedis();
	await connectKafka();

	const allowOrigin: string =
		config.appEnv === APP_ENV.PRODUCTION ? config.cors.allowOrigin : "*";
	const app = new Elysia({ prefix: config.apiPrefix })
		.use(logger.into({ autoLogging: true }))
		.use(
			cors({
				origin: allowOrigin,
				methods: config.cors.allowMethod,
				allowedHeaders: config.cors.allowHeader,
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
		.use(userRoutes)
		.use(settingRoutes);
	process.on("SIGINT", app.stop);
	process.on("SIGTERM", app.stop);
	app.listen({ port: config.appPort, maxRequestBodySize: 1_000_000_000 });

	bootLogger();
} catch (e) {
	logger.error(e, "Error booting the server");
}
