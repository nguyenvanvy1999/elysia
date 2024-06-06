import { drizzle } from "drizzle-orm/node-postgres";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { config } from "src/config";
import type { Database } from "src/db";
import * as authSchema from "src/db/schemas";

export const pgPool: Pool = new Pool({
	connectionString: config.postgresUri,
});
export const db = drizzle(pgPool, {
	logger: config.databaseDebug,
	schema: { ...authSchema },
});

const dialect = new PostgresDialect({
	pool: pgPool,
});

export const qbBb = new Kysely<Database>({
	dialect,
});
