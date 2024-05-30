import { asc, eq, ilike, or } from "drizzle-orm";
import type { Static } from "elysia";
import { RES_KEY, type listRoleQuery, type roleParam } from "src/common";
import { HttpError, db } from "src/config";
import { permissions, permissionsToRoles, roles, settings } from "src/db";
import {
	customCount,
	getCount,
	getLimit,
	getOffset,
	resBuild,
	resPagingBuild,
} from "src/util";

interface IRoleController {
	create: () => Promise<any>;
	update: () => Promise<any>;
	delete: () => Promise<any>;
	get: ({ params }: { params: Static<typeof roleParam> }) => Promise<any>;
	getList: ({ query }: { query: Static<typeof listRoleQuery> }) => Promise<any>;
}

export const roleController: IRoleController = {
	create: async () => Promise<any>,

	update: async () => Promise<any>,

	delete: async () => Promise<any>,

	get: async ({ params: { id } }): Promise<any> => {
		const role = await db.query.roles.findFirst({
			where: eq(settings.id, id),
			columns: { createdAt: false, updatedAt: false },
		});
		if (!role) {
			throw HttpError.NotFound(...Object.values(RES_KEY.ROLE_NOT_FOUND));
		}
		const permissionsData = await db
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
			.where(eq(permissionsToRoles.roleId, id))
			.orderBy(
				asc(permissions.entity),
				asc(permissions.action),
				asc(permissions.access),
			);

		return resBuild(
			{ ...role, permissions: permissionsData },
			RES_KEY.GET_ROLE,
		);
	},

	getList: async ({ query: { limit, offset, search } }): Promise<any> => {
		limit = getLimit(limit);
		offset = getOffset(offset);
		const [data, count] = await Promise.all([
			db
				.select({
					id: roles.id,
					name: roles.name,
					description: roles.description,
				})
				.from(roles)
				.where(
					search?.length
						? or(
								ilike(roles.name, `%${search}%`),
								ilike(roles.description, `%${search}%`),
							)
						: undefined,
				)
				.orderBy(asc(roles.createdAt))
				.limit(limit)
				.offset(offset),
			db
				.select({ count: customCount() })
				.from(roles)
				.where(
					search?.length
						? or(
								ilike(roles.name, `%${search}%`),
								ilike(roles.description, `%${search}%`),
							)
						: undefined,
				),
		]);

		return resPagingBuild(data, RES_KEY.LIST_ROLE, {
			count: getCount(count),
			offset,
			limit,
		});
	},
};
