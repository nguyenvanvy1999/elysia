import { Elysia } from "elysia";
import {
	type IRequestDerive,
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
	ROLE_ROUTES,
	ROUTES,
	SW_ROUTE_DETAIL,
	errorRes,
	errorsDefault,
	listRoleQuery,
	listRoleRes,
	roleGetDetailRes,
	roleParam,
	swaggerOptions,
} from "src/common";
import { roleController } from "src/controller";
import { hasPermissions, isAuthenticated } from "src/middleware";

export const roleRoutes = new Elysia<
	ROUTES.ROLE_V1,
	false,
	{
		derive: IRequestDerive;
		decorator: Record<string, unknown>;
		store: Record<string, unknown>;
		resolve: Record<string, unknown>;
	}
>({
	prefix: ROUTES.ROLE_V1,
	detail: { tags: [swaggerOptions.tags.role.name] },
})
	.use(isAuthenticated)
	.get(ROLE_ROUTES.LIST, roleController.getList, {
		beforeHandle: hasPermissions([
			{
				entity: POLICY_ENTITY.ROLE,
				access: POLICY_ACCESS.ANY,
				action: POLICY_ACTION.READ,
			},
		]),
		detail: {
			...SW_ROUTE_DETAIL.LIST_ROLE,
			security: [{ accessToken: [] }],
		},
		query: listRoleQuery,
		response: {
			200: listRoleRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	})
	.get(ROLE_ROUTES.GET, roleController.get, {
		beforeHandle: hasPermissions([
			{
				entity: POLICY_ENTITY.ROLE,
				access: POLICY_ACCESS.ANY,
				action: POLICY_ACTION.READ,
			},
		]),
		params: roleParam,
		detail: {
			...SW_ROUTE_DETAIL.GET_ROLE,
			security: [{ accessToken: [] }],
		},
		response: {
			200: roleGetDetailRes,
			404: errorRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	});
