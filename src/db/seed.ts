import { seedSettings } from "src/db/redis-seed";

async function main(): Promise<void> {
	await seedSettings();
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
