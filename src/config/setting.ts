import { SETTING_KEY } from "src/common";
import { db } from "src/config/db";
import { redisClient } from "src/config/redis";
import type { Setting } from "src/db";
import { getValue } from "src/service";

const configs: Setting[] = await db.query.settings.findMany();

export const getConfig = <T>(key: string | SETTING_KEY): T => {
	const config: Setting | undefined = configs.find((x) => x.key === key);
	if (!config) {
		throw new Error(`Setting with key ${key} does not exist`);
	}
	return getValue<T>(config);
};

export const ensureSettings = async (): Promise<void> => {
	const ensureKeys: string[] = [
		SETTING_KEY.MAINTENANCE,
		SETTING_KEY.ENB_REGISTER,
	];
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
};

export const cacheSetting = async (): Promise<void> => {
	await redisClient.mSet([
		`settings_${SETTING_KEY.MAINTENANCE}`,
		`${getConfig<boolean>(SETTING_KEY.MAINTENANCE)}`,
	]);
};
