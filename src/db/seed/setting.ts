import { logger } from "src/config";
import { seedSettings } from "src/db/seed/seed";

seedSettings()
	.catch((e): void => {
		logger.error(`Seeding error ${JSON.stringify(e)}`);
		process.exit(1);
	})
	.finally((): void => {
		logger.info("Seeding done!");
		process.exit(0);
	});
