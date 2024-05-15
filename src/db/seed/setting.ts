import { DB_ID_PREFIX, SETTING_DATA_TYPE, SETTING_KEY } from "src/common";
import { db, logger } from "src/config";
import { settings } from "src/db/schemas";
import type { Setting } from "src/db/type";
import { cleanupDB, dbIdGenerator } from "src/util";

async function main(): Promise<void> {
	logger.info("🌱 Seeding setting data...");
	await db.transaction(async (ct) => {
		logger.info("Created settings...");
		await cleanupDB(ct, settings);
		const settingCreate: Setting[] = [
			{
				id: dbIdGenerator(DB_ID_PREFIX.SETTING),
				key: SETTING_KEY.MAINTENANCE,
				value: "false",
				isEncrypt: false,
				type: SETTING_DATA_TYPE.BOOLEAN,
				description: "Maintenance status of app",
			},
			{
				id: dbIdGenerator(DB_ID_PREFIX.SETTING),
				key: SETTING_KEY.ENB_REGISTER,
				value: "true",
				isEncrypt: false,
				type: SETTING_DATA_TYPE.BOOLEAN,
				description: "Enable register in app",
			},
		];
		await ct.insert(settings).values(settingCreate);
	});

	logger.info("🌱 Setting data has been seeded");
}

main()
	.catch((e): void => {
		logger.error(`Seeding error ${JSON.stringify(e)}`);
		process.exit(1);
	})
	.finally((): void => {
		logger.info("Seeding done!");
		process.exit(0);
	});
