import type { Config } from "drizzle-kit";

console.log(process.env.POSTGRES_URI);
export default {
	schema: "./src/db/schemas/*.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.POSTGRES_URI ?? "",
	},
} satisfies Config;
