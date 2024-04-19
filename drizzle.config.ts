import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
	schema: "./src/config/drizzle/schema.ts",
	out: "./migration",
	driver: "pg",
	dbCredentials: {
		connectionString: process.env.DATABASE_URL ?? "",
	},
} satisfies Config;
