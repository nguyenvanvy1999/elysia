import chalk from "chalk";
import { client, queryClient } from "src/config";

export const gracefulShutdown = (): void => {
	console.log(chalk.yellowBright("shutting down gracefully (3 seconds) ...."));
	// disconnect DB and other services...
	client
		.disconnect()
		.then(() => console.log(chalk.yellowBright("shutdown redis ....")))
		.catch((e) => console.error(e));
	queryClient
		.end()
		.then(() => console.log(chalk.yellowBright("shutdown database ....")))
		.catch((e) => console.error(e));
	setTimeout((): void => {
		console.log("good bye");
		process.exit();
	}, 3000);
};
