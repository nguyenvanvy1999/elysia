import chalk from "chalk";
import { pgPool, redisClient } from "src/config";

export const gracefulShutdown = (): void => {
	console.log(chalk.yellowBright("shutting down gracefully (3 seconds) ...."));
	// disconnect DB and other services...
	redisClient
		.disconnect()
		.then(() => console.log(chalk.yellowBright("shutdown redis ....")))
		.catch((e) => console.error(e));
	pgPool
		.end()
		.then(() => console.log(chalk.yellowBright("shutdown database ....")))
		.catch((e) => console.error(e));
	setTimeout((): void => {
		console.log("good bye");
		process.exit();
	}, 3000);
};
