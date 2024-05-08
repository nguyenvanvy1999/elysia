import { type RedisClientType, createClient } from "redis";
import { Repository } from "redis-om";
import { env } from "src/config/env";
import { sessionSchema, settingSchema } from "src/db/redis-schemas";

export const redisClient: RedisClientType = createClient({
	password: env.redisPassword,
	url: env.redisUrl,
});

redisClient.on("error", (error) => {
	console.error(`Redis client error: ${JSON.stringify(error)}`);
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
	await redisClient.connect().then(() => console.log("Connect redis success"));
	await settingRepository.createIndex();
	await sessionRepository.createIndex();
};
