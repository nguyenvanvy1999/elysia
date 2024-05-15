import { join } from "node:path";
import { createPinoLogger, pino } from "@bogeychan/elysia-logger";
import { APP_SERVICE } from "src/common";
import { config } from "src/config/env";

export const logger = createPinoLogger({
	transport: {
		targets: [
			{
				target: "pino-roll",
				options: {
					file: join("logs", "log"),
					frequency: "daily",
					mkdir: true,
					sync: false,
				},
			},
			{
				target: "pino-pretty",
				options: {
					colorize: true,
				},
			},
		],
	},
	timestamp: pino.stdTimeFunctions.isoTime,
	level: config.logLevel,
});

export const redisLogger = logger.child({ service: APP_SERVICE.REDIS });
export const kafkaLogger = logger.child({ service: APP_SERVICE.KAFKA });
export const postgresLogger = logger.child({ service: APP_SERVICE.POSTGRES });
