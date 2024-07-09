import { Schema } from "redis-om";
import { DB_TABLE_NAME } from "src/common";

export const permissionSchema: Schema = new Schema(DB_TABLE_NAME.PERMISSION, {
	id: { type: "string", indexed: true },
	action: { type: "string", indexed: false },
	entity: { type: "string", indexed: false },
	access: { type: "string", indexed: false },
});
