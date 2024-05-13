import type { Entity } from "redis-om";
import { DB_ID_PREFIX, SETTING_DATA_TYPE, SETTING_KEY } from "src/common";
import { connectRedis, logger, settingRepository } from "src/config";
import { dbIdGenerator } from "src/util";

export async function seedSettings(): Promise<void> {
	logger.info("Seeding settings...");
	await connectRedis();

	// remove old setting
	const oldSettings: Entity[] = await settingRepository.search().all();
	await settingRepository.remove(
		oldSettings.map((x: Entity) => x.id?.toString() ?? ""),
	);

	const settings = [
		{
			id: dbIdGenerator(DB_ID_PREFIX.SETTING),
			key: SETTING_KEY.MAINTENANCE,
			value: false,
			type: SETTING_DATA_TYPE.BOOLEAN,
			description: "Maintenance status of app setting",
		},
	];

	await Promise.all(settings.map((x) => settingRepository.save(x.id, x)));
	logger.info("Settings has been seeded!");
}
