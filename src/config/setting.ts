import { inArray } from "drizzle-orm";
import { SETTING_KEY } from "src/common";
import { db } from "src/config/db";
import { redisClient } from "src/config/redis";
import { settings } from "src/db";
import { getValue } from "src/service";

export const ensureSettings = async (): Promise<void> => {
	const ensureKeys: string[] = Object.values(SETTING_KEY);
	const configs = await db.query.settings.findMany({
		where: inArray(settings.key, ensureKeys),
	});
	const missingSettings: string[] = ensureKeys.filter(
		(a) => !configs.some((x) => x.key === a),
	);
	if (missingSettings.length) {
		throw new Error(
			`Missing these settings ${missingSettings.join(
				", ",
			)} from DB. please run seed to add it`,
		);
	}

	// cache settings
	await redisClient.mSet(
		configs.reduce(
			(prev, cur) => Object.assign(prev, { [cur.key]: getValue(cur, true) }),
			{},
		),
	);
};
