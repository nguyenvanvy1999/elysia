import { seedTranslationsData } from "src/db/seed-db";

async function main(): Promise<void> {
	await seedTranslationsData();
	// await seedAuthData();
}

main()
	.catch((e): void => {
		console.error(e);
		process.exit(1);
	})
	.finally((): void => {
		console.log("Seeding done!");
		process.exit(0);
	});
