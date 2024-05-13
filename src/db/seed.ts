import { logger } from "src/config";
import { seedSettings } from "src/db/redis-seed";
import { seedAuthData, seedTranslationsData } from "src/db/seed-db";

async function main(): Promise<void> {
	await seedTranslationsData();
	await seedAuthData();
	await seedSettings();
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
