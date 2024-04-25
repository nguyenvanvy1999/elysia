import { Schema } from "redis-om";
import { DB_TABLE_NAME } from "src/common";

export const settingSchema: Schema = new Schema(DB_TABLE_NAME.SETTING, {
	id: { type: "string", indexed: true },
	key: { type: "string", indexed: true },
	value: { type: "string" },
	type: { type: "string" },
	description: { type: "string" },
});
