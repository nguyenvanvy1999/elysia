import type { Entity } from "redis-om";
import {
	DB_ID_PREFIX,
	type IVersionOption,
	SETTINGS,
	SETTING_DATA_TYPE,
} from "src/common";
import { connectRedis, logger, settingRepository } from "src/config";
import { dbIdGenerator } from "src/util";

export async function seedSettings(): Promise<void> {
	logger.info("Seeding settings...");
	await connectRedis();

	const versionOptions = {
		repoVersion: "1.0.50",
		version: "1.0.50",
	} satisfies IVersionOption;

	// remove old setting
	const oldSettings: Entity[] = await settingRepository.search().all();
	await settingRepository.remove(
		oldSettings.map((x) => x.id?.toString() ?? ""),
	);

	const settings = [
		{
			id: dbIdGenerator(DB_ID_PREFIX.SETTING),
			key: SETTINGS.VERSION_OPTION,
			value: JSON.stringify(versionOptions),
			type: SETTING_DATA_TYPE.JSON,
			description: "Version of app setting",
		},
		{
			id: dbIdGenerator(DB_ID_PREFIX.SETTING),
			key: SETTINGS.AVAILABLE_LANGUAGES,
			value: JSON.stringify(["en", "vi"]),
			type: SETTING_DATA_TYPE.JSON,
			description: "App available languages",
		},
		{
			id: dbIdGenerator(DB_ID_PREFIX.SETTING),
			key: SETTINGS.DEFAULT_LANGUAGE,
			value: "en",
			type: SETTING_DATA_TYPE.STRING,
			description: "Default app language",
		},
		{
			id: dbIdGenerator(DB_ID_PREFIX.SETTING),
			key: SETTINGS.PASSWORD_EXPIRED_TIME,
			value: "180d",
			type: SETTING_DATA_TYPE.STRING,
			description: "Password expired",
		},
		{
			id: dbIdGenerator(DB_ID_PREFIX.SETTING),
			key: SETTINGS.PASSWORD_ATTEMPTS,
			value: "3",
			type: SETTING_DATA_TYPE.NUMBER,
			description: "Password attempt",
		},
		{
			id: dbIdGenerator(DB_ID_PREFIX.SETTING),
			key: SETTINGS.SALT_LENGTH,
			value: "8",
			type: SETTING_DATA_TYPE.NUMBER,
			description: "Password salt length",
		},
	];

	await Promise.all(settings.map((x) => settingRepository.save(x.id, x)));
	logger.info("Settings has been seeded!");
}
