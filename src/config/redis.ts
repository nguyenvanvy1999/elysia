import chalk from "chalk";
import { type RedisClientType, createClient } from "redis";
import { Repository } from "redis-om";
import { config } from "src/config/config";
import { redisLogger } from "src/config/logger";
import { sessionSchema, settingSchema } from "src/db/redis-schemas";

export const redisClient: RedisClientType = createClient({
	password: config.redisPassword,
	url: config.redisUrl,
});

redisClient.on("error", (error) => {
	redisLogger.error(`❌  Redis client error: ${JSON.stringify(error)}`);
});

export const settingRepository: Repository = new Repository(
	settingSchema,
	redisClient,
);

export const sessionRepository: Repository = new Repository(
	sessionSchema,
	redisClient,
);

export const connectRedis = async (): Promise<void> => {
	try {
		await redisClient.connect();
		redisLogger.info(chalk.green("✅  Connect redis success"));
		await settingRepository.createIndex();
		redisLogger.info(
			chalk.green("✅  Create setting repository index success"),
		);
		await sessionRepository.createIndex();
		redisLogger.info(
			chalk.green("✅  Create session repository index success"),
		);
	} catch (e) {
		redisLogger.error(`❌  Connect redis failed: ${JSON.stringify(e)}`);
	}
};
