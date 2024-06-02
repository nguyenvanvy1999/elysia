import { and, asc, eq, ilike, inArray, ne, or } from "drizzle-orm";
import type { Static } from "elysia";
import {
	DB_ID_PREFIX,
	RES_KEY,
	ROLE_NAME,
	type createRoleBody,
	type listRoleQuery,
	type roleParam,
	type updateRoleBody,
} from "src/common";
import { HttpError, db } from "src/config";
import {
	type PermissionRole,
	permissions,
	permissionsToRoles,
	roles,
	settings,
} from "src/db";
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
	update: ({
		body,
		params,
	}: {
		body: Static<typeof updateRoleBody>;
		params: Static<typeof roleParam>;
	}) => Promise<any>;
	delete: ({ params }: { params: Static<typeof roleParam> }) => Promise<any>;
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

	update: async ({ body, params: { id } }): Promise<any> => {
		const { description } = body;
		const name = body.name.toLowerCase();
		const permissionIds = uniqueArr(body.permissionIds);
		if (Object.values<string>(ROLE_NAME).includes(name)) {
			throw HttpError.Forbidden(
				...Object.values(RES_KEY.CAN_NOT_MODIFY_DEFAULT_ROLE),
			);
		}
		const findRoles = await db.query.roles.findMany({
			where: or(eq(roles.id, id), and(eq(roles.name, name), ne(roles.id, id))),
			columns: { id: true, name: true },
		});
		if (!findRoles.some((x) => x.id === id)) {
			throw HttpError.NotFound(...Object.values(RES_KEY.ROLE_NOT_FOUND));
		}
		if (findRoles.some((x) => x.id !== id && x.name === name)) {
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
			const permissionRoles = await ct.query.permissionsToRoles.findMany({
				where: eq(permissionsToRoles.roleId, id),
			});
			const createLst: PermissionRole[] = permissionIds.reduce((curr, val) => {
				if (permissionRoles.every((a) => a.permissionId !== val)) {
					curr.push({ roleId: id, permissionId: val });
				}
				return curr;
			}, [] as PermissionRole[]);
			const deleteLst: string[] = permissionRoles.reduce((curr, val) => {
				if (!permissionIds.includes(val.permissionId)) {
					curr.push(val.permissionId);
				}
				return curr;
			}, [] as string[]);

			if (createLst.length) {
				await ct.insert(permissionsToRoles).values(createLst);
			}
			if (deleteLst.length) {
				await ct
					.delete(permissionsToRoles)
					.where(inArray(permissionsToRoles.permissionId, deleteLst));
			}

			return await ct
				.update(roles)
				.set({ name, description, updatedAt: new Date() })
				.where(eq(roles.id, id))
				.returning({
					id: roles.id,
					name: roles.name,
					description: roles.description,
				})
				.then((x) => x[0]);
		});

		const permissionsData = await policyService.getPermissionsByRoleId(role.id);

		return resBuild(
			{ ...role, permissions: permissionsData },
			RES_KEY.UPDATE_ROLE,
		);
	},

	delete: async ({ params: { id } }): Promise<any> => {
		const exist = await db.query.roles.findFirst({
			where: eq(roles.id, id),
			columns: { id: true, name: true },
		});
		if (!exist) {
			throw HttpError.NotFound(...Object.values(RES_KEY.ROLE_NOT_FOUND));
		}
		if (Object.values<string>(ROLE_NAME).includes(exist.name)) {
			throw HttpError.BadRequest(
				...Object.values(RES_KEY.CAN_NOT_MODIFY_DEFAULT_ROLE),
			);
		}
		const result = await db.transaction(async (ct) => {
			await ct
				.delete(permissionsToRoles)
				.where(eq(permissionsToRoles.roleId, id));
			return await db
				.delete(roles)
				.where(eq(roles.id, id))
				.returning({ id: roles.id })
				.then((x) => x[0]);
		});
		return resBuild({ id: result.id }, RES_KEY.DELETE_ROLE);
	},

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
