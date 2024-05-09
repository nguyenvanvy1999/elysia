import { logger } from "src/config";
import { seedAuthData, seedTranslationsData } from "src/db/seed-db";

async function main(): Promise<void> {
	await seedTranslationsData();
	await seedAuthData();
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
