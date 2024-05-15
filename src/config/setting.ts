import { SETTING_KEY } from "src/common";
import { db } from "src/config/db";
import type { Setting } from "src/db";
import { getValue } from "src/service";

const configs: Setting[] = await db.query.settings.findMany();

export const getSetting = <T>(key: string | SETTING_KEY): T => {
	const config: Setting | undefined = configs.find(
		(x: Setting) => x.key === key,
	);
	if (!config) {
		throw new Error(`Setting with key ${key} does not exist`);
	}
	return getValue<T>(config);
};

export const ensureSettings = async (): Promise<void> => {
	const ensureKeys: string[] = Object.values(SETTING_KEY);
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