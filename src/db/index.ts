import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "src/config";
import * as authSchema from "./schemas/auth";

const queryClient = postgres(env.DATABASE_URL);
export const db = drizzle(queryClient, {
	logger: true,
	schema: { ...authSchema },
});
