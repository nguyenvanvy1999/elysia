import { join } from "node:path";
import { createPinoLogger, pino } from "@bogeychan/elysia-logger";
import { APP_SERVICE } from "src/common";

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
});

export const redisLogger = logger.child({ service: APP_SERVICE.REDIS });
export const kafkaLogger = logger.child({ service: APP_SERVICE.KAFKA });
export const postgresLogger = logger.child({ service: APP_SERVICE.POSTGRES });
