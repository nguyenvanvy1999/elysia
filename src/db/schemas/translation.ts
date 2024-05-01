import { pgTable, text } from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { DB_TABLE_NAME } from "src/common";

export const translations = pgTable(
	DB_TABLE_NAME.TRANSLATION,
	{
		lang: text("lang").notNull(),
		ns: text("ns").notNull(),
		key: text("key").notNull(),
		value: text("value").notNull(),
	},
	(vt) => ({
		langIdx: index("lang_idx").on(vt.lang),
		nsIdx: index("ns_idx").on(vt.ns),
		keyIdx: index("key_idx").on(vt.key),
	}),
);
