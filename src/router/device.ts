import { Elysia } from "elysia";
import {
	DEVICE_ROUTES,
	type IRequestDerive,
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
	ROUTES,
	SW_ROUTE_DETAIL,
	errorRes,
	errorsDefault,
	listDeviceQuery,
	listDeviceRes,
	swaggerOptions,
} from "src/common";
import { deviceController } from "src/controller";
import { hasPermissions, isAuthenticated } from "src/middleware";

export const deviceRoutes = new Elysia<
	ROUTES.DEVICE_V1,
	false,
	{
		derive: IRequestDerive;
		decorator: Record<string, unknown>;
		store: Record<string, unknown>;
		resolve: Record<string, unknown>;
	}
>({
	prefix: ROUTES.DEVICE_V1,
	detail: { tags: [swaggerOptions.tags.device.name] },
})
	.use(isAuthenticated)
	.get(DEVICE_ROUTES.LIST, deviceController.getList, {
		beforeHandle: hasPermissions([
			{
				entity: POLICY_ENTITY.DEVICE,
				access: POLICY_ACCESS.OWNER,
				action: POLICY_ACTION.READ,
			},
		]),
		detail: {
			...SW_ROUTE_DETAIL.LIST_DEVICES,
			security: [{ accessToken: [] }],
		},
		query: listDeviceQuery,
		response: {
			200: listDeviceRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	});
