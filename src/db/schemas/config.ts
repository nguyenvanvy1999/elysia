import { pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { DB_TABLE_NAME } from "src/common";

export const settingTypeEnum = pgEnum("setting_type_enum", [
	"string",
	"number",
	"boolean",
	"json",
	"date",
]);

export const settings = pgTable(DB_TABLE_NAME.SETTING, {
	id: varchar("id", { length: 32 }).notNull().primaryKey(),
	key: text("key").unique().notNull(),
	description: text("description"),
	type: settingTypeEnum("type").notNull(),
	value: varchar("value", { length: 2048 }).notNull(),
});
