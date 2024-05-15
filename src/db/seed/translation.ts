import { translates } from "src/common";
import { db, logger } from "src/config";
import { translations } from "src/db/schemas";
import { cleanupDB } from "src/util";

async function main(): Promise<void> {
	logger.info("🌱 Seeding translation data...");
	await db.transaction(async (ct) => {
		logger.info("Created translations...");
		await cleanupDB(ct, translations);

		await ct.insert(translations).values(translates);
	});

	logger.info("🌱 Translation data has been seeded");
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
