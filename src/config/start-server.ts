import { inArray } from "drizzle-orm";
import { ROLE_NAME, SETTING_KEY } from "src/common";
import { db } from "src/config/db";
import { redisClient } from "src/config/redis";
import { roles, settings } from "src/db";
import { settingService } from "src/service";

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
			)} from DB. please run db:seed:setting to add it`,
		);
	}

	// cache settings
	await redisClient.mSet(
		configs.reduce(
			(prev, cur) =>
				Object.assign(prev, { [cur.key]: settingService.getValue(cur, true) }),
			{},
		),
	);
};

export const ensureRoles = async (): Promise<void> => {
	const ensureRoles: string[] = Object.values(ROLE_NAME);
	const allRoles = await db.query.roles.findMany({
		where: inArray(roles.name, ensureRoles),
		columns: { name: true },
	});
	const missingRoles: string[] = ensureRoles.filter(
		(a) => !allRoles.some((x) => x.name === a),
	);
	if (missingRoles.length) {
		throw new Error(
			`Missing these roles ${missingRoles.join(
				", ",
			)} from DB. please run db:seed:auth to add it`,
		);
	}
};
