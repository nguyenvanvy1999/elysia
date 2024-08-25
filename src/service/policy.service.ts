import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { asc, eq } from "drizzle-orm";
import {
	type IPolicyAbility,
	type IPolicyRequest,
	type IPolicyRule,
	POLICY_ACTION,
	type PolicyHandler,
	ROLE_NAME,
} from "src/common";
import { db } from "src/config";
import { type Permission, permissions, permissionsToRoles } from "src/db";

interface IPolicyService {
	defineAbilityFromRole: ({
		name,
		permissions,
	}: IPolicyRequest) => IPolicyAbility;

	handlerRules: (rules: IPolicyRule[]) => PolicyHandler[];

	execPolicyHandler: (
		handler: PolicyHandler,
		ability: IPolicyAbility,
	) => boolean;

	getPermissionsByRoleId: (
		roleId: string,
	) => Promise<Omit<Permission, "updatedAt" | "createdAt">[]>;
}

export const policyService: IPolicyService = {
	getPermissionsByRoleId: (
		roleId: string,
	): Promise<Omit<Permission, "updatedAt" | "createdAt">[]> => {
		return db
			.select({
				id: permissions.id,
				action: permissions.action,
				access: permissions.access,
				entity: permissions.entity,
				description: permissions.description,
			})
			.from(permissionsToRoles)
			.leftJoin(
				permissions,
				eq(permissionsToRoles.permissionId, permissions.id),
			)
			.where(eq(permissionsToRoles.roleId, roleId))
			.orderBy(
				asc(permissions.entity),
				asc(permissions.action),
				asc(permissions.access),
			) as Promise<Omit<Permission, "updatedAt" | "createdAt">[]>;
	},

	defineAbilityFromRole: ({
		name,
		permissions,
	}: IPolicyRequest): IPolicyAbility => {
		const { can, build } = new AbilityBuilder<IPolicyAbility>(
			createMongoAbility,
		);

		if (name === ROLE_NAME.ADMIN) {
			can(POLICY_ACTION.MANAGE, "all");
		} else {
			for (const permission of permissions) {
				can(permission.action, permission.entity);
			}
		}

		return build();
	},

	handlerRules: (rules: IPolicyRule[]): PolicyHandler[] => {
		return rules.flatMap(({ entity, action }) => {
			return (ability: IPolicyAbility) => ability.can(action, entity);
		});
	},

	execPolicyHandler: (
		handler: PolicyHandler,
		ability: IPolicyAbility,
	): boolean => {
		if (typeof handler === "function") {
			return handler(ability);
		}
		return handler.handle(ability);
	},
};
