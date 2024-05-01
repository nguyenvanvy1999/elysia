import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "src/config";
import * as authSchema from "src/db/schemas";

export const pgPool: Pool = new Pool({
	connectionString: env.DATABASE_URL,
});
export const db = drizzle(pgPool, {
	logger: true,
	schema: { ...authSchema },
});
