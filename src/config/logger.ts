import { join } from "node:path";
import pino from "pino";

const transport = pino.transport({
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
});

export const logger = pino(transport);

export const redisLogger = logger.child({ service: "redis" });
export const kafkaLogger = logger.child({ service: "kafka" });
export const postgresLogger = logger.child({ service: "postgres" });
