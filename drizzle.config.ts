import type { Config } from "drizzle-kit";
import { env } from "src/config";

export default {
	schema: "./src/db/schemas/*.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: env.postgresUri,
	},
} satisfies Config;
