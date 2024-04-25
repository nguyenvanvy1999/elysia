import { createClient } from "redis";
import { Repository } from "redis-om";
import { env } from "src/config/env";
import { settingSchema } from "src/db/redis-schemas";

export const client = createClient({
	password: env.REDIS_PASSWORD,
	url: env.REDIS_URL,
});

client.on("error", (error) => {
	console.error(`Redis client error: ${JSON.stringify(error)}`);
});

export const settingRepository: Repository = new Repository(
	settingSchema,
	client,
);

export const connectRedis = async (): Promise<void> => {
	await client.connect().then(() => console.log("Connect redis success"));
	await settingRepository.createIndex();
};
