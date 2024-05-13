import { eq } from "drizzle-orm";
import type { Elysia } from "elysia";
import {
	AVAILABLE_LANGUAGES,
	type IResponse,
	type IResponseMetadata,
	RES_KEY,
	SETTING_KEY,
} from "src/common";
import { db } from "src/config/db";
import { redisClient } from "src/config/redis";
import { settings } from "src/db";
import { getValue } from "src/service";
import { translate } from "src/util/translate";

export const loadMaintenanceStatus = async (): Promise<void> => {
	let maintenance = false;
	const maintenanceConfig = await db.query.settings.findFirst({
		where: eq(settings.key, SETTING_KEY.MAINTENANCE),
		// columns: { value: true, isEncrypt: true, type: true },
	});
	if (maintenanceConfig) {
		maintenance = getValue<boolean>(maintenanceConfig) ?? maintenance;
	}
	await redisClient.set(
		`settings_${SETTING_KEY.MAINTENANCE}`,
		`${maintenance}`,
	);
};

export const maintenance = async (app: Elysia) =>
	app.onRequest(async ({ set, request }): Promise<IResponse | undefined> => {
		const maintenance: string | null = await redisClient.get(
			`settings_${SETTING_KEY.MAINTENANCE}`,
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
