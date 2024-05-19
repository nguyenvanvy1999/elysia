import { logger } from "src/config";
import { seedAuth } from "src/db/seed/seed";

seedAuth()
	.catch((e): void => {
		logger.error(`Seeding error ${JSON.stringify(e)}`);
		process.exit(1);
	})
	.finally((): void => {
		logger.info("Seeding done!");
		process.exit(0);
	});
