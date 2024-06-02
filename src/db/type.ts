import type { InferSelectModel } from "drizzle-orm";
import type {
	permissions,
	permissionsToRoles,
	settings,
	users,
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
