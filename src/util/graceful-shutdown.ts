import chalk from "chalk";

export const gracefulShutdown = (): void => {
	console.log(chalk.yellowBright("shutting down gracefully (5 seconds) ...."));
	// disconnect DB and other services...
	setTimeout((): void => {
		console.log("good bye");
		process.exit();
	}, 5000);
};
