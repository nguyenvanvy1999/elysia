import { join } from "node:path";
import { createPinoLogger } from "@bogeychan/elysia-logger";
import { APP_SERVICE } from "src/common";

export const logger = createPinoLogger({
	transport: {
		targets: [
			{
				target: "pino-roll",
				options: { file: join("logs", "log"), frequency: "daily", mkdir: true },
			},
			{
				target: "pino-pretty",
				options: {
					colorize: true,
				},
			},
		],
	},
});

export const redisLogger = logger.child({ service: APP_SERVICE.REDIS });
export const kafkaLogger = logger.child({ service: APP_SERVICE.KAFKA });
export const postgresLogger = logger.child({ service: APP_SERVICE.POSTGRES });
