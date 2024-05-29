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
	swaggerOptions,
} from "src/common";
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
	});
