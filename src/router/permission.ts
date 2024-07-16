import { Elysia } from "elysia";
import {
	type IRequestDerive,
	PERMISSIONS_ROUTES,
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
	ROUTES,
	SW_ROUTE_DETAIL,
	errorRes,
	errorsDefault,
	listPermissionQuery,
	listPermissionRes,
	permissionParam,
	permissionRes,
	swaggerOptions,
} from "src/common";
import { updatePermissionBody } from "src/common/dtos/permission/update";
import { permissionController } from "src/controller";
import { hasPermissions, isAuthenticated } from "src/middleware";

export const permissionRoutes = new Elysia<
	ROUTES.PERMISSION_V1,
	false,
	{
		derive: IRequestDerive;
		decorator: Record<string, unknown>;
		store: Record<string, unknown>;
		resolve: Record<string, unknown>;
	}
>({
	prefix: ROUTES.PERMISSION_V1,
	detail: { tags: [swaggerOptions.tags.permission.name] },
})
	.use(isAuthenticated)
	.get(PERMISSIONS_ROUTES.LIST, permissionController.getList, {
		beforeHandle: hasPermissions([
			{
				entity: POLICY_ENTITY.PERMISSION,
				access: POLICY_ACCESS.ANY,
				action: POLICY_ACTION.READ,
			},
		]),
		detail: {
			...SW_ROUTE_DETAIL.LIST_PERMISSION,
			security: [{ accessToken: [] }],
		},
		query: listPermissionQuery,
		response: {
			200: listPermissionRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	})
	.put(PERMISSIONS_ROUTES.UPDATE, permissionController.update, {
		beforeHandle: hasPermissions([
			{
				entity: POLICY_ENTITY.PERMISSION,
				access: POLICY_ACCESS.ANY,
				action: POLICY_ACTION.UPDATE,
			},
		]),
		params: permissionParam,
		body: updatePermissionBody,
		detail: {
			...SW_ROUTE_DETAIL.UPDATE_PERMISSION,
			security: [{ accessToken: [] }],
		},
		response: {
			200: permissionRes,
			404: errorRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	});
