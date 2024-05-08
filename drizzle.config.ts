import type { Config } from "drizzle-kit";
import { env } from "src/config";

export default {
	schema: "./src/db/schemas/*.ts",
	out: "./src/db/migrations",
	driver: "pg",
	dbCredentials: {
		connectionString: env.postgresUri,
	},
} satisfies Config;
