import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import cors from "@elysiajs/cors";
import chalk from "chalk";
import { type Context, Elysia } from "elysia";
import { compression } from "elysia-compression";
import { APP_ENV } from "src/common";
import {
	ElysiaAdapter,
	config,
	connectRedis,
	ensurePermissions,
	ensureRoles,
	ensureSettings,
	httpError,
	httpResponse,
	logger,
	maintenance,
	requestHeader,
	sendEmailQueue,
	swaggerConfig,
} from "src/config";
import {
	authRoutes,
	deviceRoutes,
	permissionRoutes,
	roleRoutes,
	settingRoutes,
	userRoutes,
} from "src/router";
import { gracefulShutdown } from "src/util";

try {
	await connectRedis();
	await ensureSettings();
	await ensurePermissions();
	await ensureRoles();

	const app = new Elysia();

	if (config.enbBullBoard) {
		const serverAdapter = new ElysiaAdapter(app);
		serverAdapter.setBasePath(config.bullBoardPath);
		createBullBoard({
			queues: [new BullMQAdapter(sendEmailQueue)],
			serverAdapter,
		});
	}

	const allowOrigin: string =
		config.appEnv === APP_ENV.PRODUCTION ? config.cors.allowOrigin : "*";
	app
		.use(
			logger.into({
				autoLogging: {
					ignore: ({ path }: Context) => {
						const loggerIgnores: string[] = [
							config.swaggerUiPath,
							config.bullBoardPath,
						];
						return loggerIgnores.some((a) =>
							path.includes(a.replaceAll("/", "")),
						);
					},
				},
			}),
		)
		.use(
			cors({
				origin: allowOrigin,
				methods: config.cors.allowMethod,
				allowedHeaders: config.cors.allowHeader,
				preflight: false,
			}),
		)
		.onRequest(maintenance)
		.use(
			requestHeader({
				ip: true,
				timezone: true,
				timestamp: true,
				customLanguage: true,
				id: true,
				version: true,
				repoVersion: true,
				userAgent: true,
			}),
		)
		.use(httpError())
		.use(httpResponse())
		.use(swaggerConfig())
		.use(compression())
		.onStop(gracefulShutdown)
		.use(authRoutes)
		.use(userRoutes)
		.use(settingRoutes)
		.use(deviceRoutes)
		.use(permissionRoutes)
		.use(roleRoutes);
	process.on("SIGINT", app.stop);
	process.on("SIGTERM", app.stop);
	app.listen({ port: config.appPort, maxRequestBodySize: 1_000_000_000 });

	if (config.appEnv === APP_ENV.DEVELOPMENT) {
		logger.info(
			`🦊 Elysia is running at ${chalk.blueBright(
				"http://localhost:",
			)}${chalk.greenBright(config.appPort)}`,
		);
	}
} catch (e) {
	logger.error(e, "Error booting the server");
	process.exit();
}
