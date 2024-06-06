import type { InferSelectModel } from "drizzle-orm";
import type { Kyselify } from "drizzle-orm/kysely";
import type {
	permissions,
	permissionsToRoles,
	roles,
	settings,
	users,
	usersToRoles,
} from "src/db/schemas";

export type Setting = InferSelectModel<typeof settings>;

export type UserWithRoles = InferSelectModel<typeof users> & {
	roles: {
		id: string;
		name: string;
		permissions: InferSelectModel<typeof permissions>[];
	}[];
};

export type Permission = InferSelectModel<typeof permissions>;

export type PermissionRole = InferSelectModel<typeof permissionsToRoles>;

export interface Database {
	user: Kyselify<typeof users>;
	role: Kyselify<typeof roles>;
	user_to_role: Kyselify<typeof usersToRoles>;
	permission: Kyselify<typeof permissions>;
	permission_to_role: Kyselify<typeof permissionsToRoles>;
}
