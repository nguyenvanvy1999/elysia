import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "src/config";
import * as authSchema from "src/db/schemas";

export const pgPool: Pool = new Pool({
	connectionString: config.postgresUri,
});
export const db = drizzle(pgPool, {
	logger: config.databaseDebug,
	schema: { ...authSchema },
});
