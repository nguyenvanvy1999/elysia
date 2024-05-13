import type { InferSelectModel } from "drizzle-orm";
import type { permissions, settings, users } from "src/db/schemas";

export type Setting = InferSelectModel<typeof settings>;

export type UserWithRoles = InferSelectModel<typeof users> & {
	roles: {
		roleId: string;
		permissions: InferSelectModel<typeof permissions>[];
	}[];
};
