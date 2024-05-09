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
import { maintenance } from "src/config/maintenace";
import { authRoutes, userRoutes } from "src/router";
import { bootLogger, gracefulShutdown } from "src/util";

try {
	await connectRedis();
	const app = new Elysia({ prefix: env.apiPrefix })
		.use(
			cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }),
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
	app.listen(env.appPort);

	bootLogger();
} catch (e) {
	console.log("error booting the server");
	console.error(e);
}
