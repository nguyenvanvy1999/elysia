import { logger } from "src/config";
import { seedTranslations } from "src/db/seed/seed";

seedTranslations()
	.catch((e): void => {
		logger.error(`Seeding error ${JSON.stringify(e)}`);
		process.exit(1);
	})
	.finally((): void => {
		logger.info("Seeding done!");
		process.exit(0);
	});
