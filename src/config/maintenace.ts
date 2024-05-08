import type { Elysia } from "elysia";
import {
	AVAILABLE_LANGUAGES,
	type IResponse,
	type IResponseMetadata,
	REDIS_KEY,
	RES_KEY,
} from "src/common";
import { redisClient } from "src/config/redis";
import { translate } from "src/util/translate";

export const maintenance = async (app: Elysia) =>
	app.onRequest(async ({ set, request }): Promise<IResponse | undefined> => {
		const maintenance: string | null = await redisClient.get(
			REDIS_KEY.SETTING_MAINTENANCE,
		);
		if (maintenance === "true") {
			const metadata = {
				languages: AVAILABLE_LANGUAGES,
				timestamp: Date.now(),
				url: request.url,
				method: request.method,
			} satisfies IResponseMetadata;
			return {
				metadata,
				message: await translate(RES_KEY.MAINTENANCE.message),
				code: RES_KEY.MAINTENANCE.code,
			} satisfies IResponse;
		}
	});
