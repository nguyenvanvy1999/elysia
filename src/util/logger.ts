import chalk from "chalk";
import { APP_ENV } from "src/common";
import { env, logger } from "src/config";

export function bootLogger(): void {
	if (env.appEnv === APP_ENV.DEVELOPMENT) {
		logger.info(
			`🦊 Elysia is running at ${chalk.blueBright(
				"http://localhost:",
			)}${chalk.greenBright(process.env.PORT)}`,
		);
	}
}
