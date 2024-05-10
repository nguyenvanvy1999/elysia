import type { Config } from "drizzle-kit";
import { config } from "src/config";

export default {
	schema: "./src/db/schemas/*.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: config.postgresUri,
	},
} satisfies Config;
