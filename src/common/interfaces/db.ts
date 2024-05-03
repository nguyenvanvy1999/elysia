import type { PgColumn } from "drizzle-orm/pg-core";

export interface IColumnSelect {
	[key: string]: PgColumn;
}
