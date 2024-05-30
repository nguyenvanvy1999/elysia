import { asc, eq, ilike, inArray, or } from "drizzle-orm";
import type { Static } from "elysia";
import {
	DB_ID_PREFIX,
	RES_KEY,
	type createRoleBody,
	type listRoleQuery,
	type roleParam,
} from "src/common";
import { HttpError, db } from "src/config";
import { permissions, permissionsToRoles, roles, settings } from "src/db";
import { policyService } from "src/service";
import {
	customCount,
	getCount,
	getLimit,
	getOffset,
	idGenerator,
	resBuild,
	resPagingBuild,
	uniqueArr,
} from "src/util";

interface IRoleController {
	create: ({ body }: { body: Static<typeof createRoleBody> }) => Promise<any>;
	update: () => Promise<any>;
	delete: () => Promise<any>;
	get: ({ params }: { params: Static<typeof roleParam> }) => Promise<any>;
	getList: ({ query }: { query: Static<typeof listRoleQuery> }) => Promise<any>;
}

export const roleController: IRoleController = {
	create: async ({ body }): Promise<any> => {
		const { name, description } = body;
		const permissionIds = uniqueArr(body.permissionIds);

		const exist = await db.query.roles.findFirst({
			where: eq(roles.name, name.toLowerCase()),
			columns: { id: true },
		});
		if (exist) {
			throw HttpError.Conflict(...Object.values(RES_KEY.ROLE_ALREADY_EXIST));
		}
		const permissionsCnt = await db
			.select({ count: customCount() })
			.from(permissions)
			.where(inArray(permissions.id, permissionIds));
		if (getCount(permissionsCnt) !== permissionIds.length) {
			throw HttpError.Conflict(...Object.values(RES_KEY.PERMISSION_IDS_WRONG));
		}

		const role = await db.transaction(async (ct) => {
			const roleRes = await ct
				.insert(roles)
				.values({ id: idGenerator(DB_ID_PREFIX.ROLE), name, description })
				.returning({
					id: roles.id,
					name: roles.name,
					description: roles.description,
				})
				.then((res) => res[0]);
			await ct
				.insert(permissionsToRoles)
				.values(
					permissionIds.map((x) => ({ permissionId: x, roleId: roleRes.id })),
				);
			return roleRes;
		});
		const permissionsData = await policyService.getPermissionsByRoleId(role.id);

		return resBuild(
			{ ...role, permissions: permissionsData },
			RES_KEY.CREATE_ROLE,
		);
	},

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
		const permissionsData = await policyService.getPermissionsByRoleId(id);
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
