import { Schema } from "redis-om";
import { DB_TABLE_NAME } from "src/common";

export const sessionSchema: Schema = new Schema(DB_TABLE_NAME.SESSION, {
	id: { type: "string", indexed: true },
	userId: { type: "string", indexed: true },
	refreshSessionId: { type: "string", indexed: true },
});
