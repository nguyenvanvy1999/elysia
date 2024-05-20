import chalk from "chalk";
import {
	logger,
	pgPool,
	postgresLogger,
	queueLogger,
	redisClient,
	redisLogger,
	sendEmailQueue,
} from "src/config";

export const gracefulShutdown = (): void => {
	logger.warn(chalk.yellowBright("Shutting down gracefully (2 seconds) ...."));
	// disconnect DB and other services...
	redisClient
		.disconnect()
		.then(() => redisLogger.warn(chalk.yellow("✅  Shutdown redis success")))
		.catch((e) =>
			redisLogger.error(`❌  Shutdown redis failed: ${JSON.stringify(e)}`),
		);
	pgPool
		.end()
		.then(() =>
			postgresLogger.warn(chalk.yellow("✅  Shutdown postgres success")),
		)
		.catch((e) =>
			postgresLogger.error(
				`❌  Shutdown postgres failed: ${JSON.stringify(e)}`,
			),
		);

	sendEmailQueue
		.close()
		.then(() => queueLogger.warn(chalk.yellow("✅  Shutdown queue success")))
		.catch((e) =>
			queueLogger.error(`❌  Shutdown queue failed: ${JSON.stringify(e)}`),
		);

	setTimeout((): void => {
		logger.warn(chalk.yellowBright("✅  Shutdown success"));
		process.exit();
	}, 2000);
};
