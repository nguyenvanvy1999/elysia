import type { Elysia } from "elysia";
import {
	AVAILABLE_LANGUAGES,
	type IResponse,
	type IResponseMetadata,
	RES_KEY,
	SETTING_KEY,
} from "src/common";
import { redisClient } from "src/config/redis";
import { translate } from "src/util";

export const maintenance = async (app: Elysia) =>
	app.onRequest(async ({ set, request }): Promise<IResponse | undefined> => {
		const maintenance: string | null = await redisClient.get(
			SETTING_KEY.MAINTENANCE,
		);
		if (maintenance === "true") {
			set.status = 503;
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
