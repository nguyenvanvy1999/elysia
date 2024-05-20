import { beforeAll } from "bun:test";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { connectRedis, db } from "src/config";
import { seedAuth, seedSettings, seedTranslations } from "src/db/seed/seed";

beforeAll(async (): Promise<void> => {
	if (process.env.TEST_MIGRATION === "true") {
		await migrate(db, { migrationsFolder: "src/db/migrations" });
	}
	if (process.env.TEST_SEED === "true") {
		await seedAuth();
		await seedSettings();
		await seedTranslations();
	}
	await connectRedis();
});
