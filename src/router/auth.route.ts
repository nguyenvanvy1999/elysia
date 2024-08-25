import { Elysia } from "elysia";
import {
	AUTH_ROUTES,
	type IRequestDerive,
	ROUTES,
	SW_ROUTE_DETAIL,
	confirmDeviceQuery,
	confirmDeviceRes,
	errorRes,
	errorsDefault,
	loginBody,
	loginRes,
	logoutAllRes,
	logoutDeviceQuery,
	logoutDeviceRes,
	logoutRes,
	magicLoginQuery,
	magicLoginRes,
	registerBody,
	registerRes,
	sendMagicLinkBody,
	sendMagicLinkRes,
	swaggerOptions,
} from "src/common";
import { authController } from "src/controller";
import { isAuthenticated } from "src/middleware";

export const authRoutes = new Elysia<
	ROUTES.AUTH_V1,
	false,
	{
		derive: IRequestDerive;
		decorator: Record<string, unknown>;
		store: Record<string, unknown>;
		resolve: Record<string, unknown>;
	}
>({
	prefix: ROUTES.AUTH_V1,
	detail: { tags: [swaggerOptions.tags.auth.name] },
})
	.post(AUTH_ROUTES.SEND_MAGIC_LOGIN_LINK, authController.sendMagicLink, {
		body: sendMagicLinkBody,
		detail: SW_ROUTE_DETAIL.SEND_EMAIL_MAGIC_LOGIN,
		response: {
			200: sendMagicLinkRes,
			404: errorRes,
			...errorsDefault,
		},
	})
	.get(AUTH_ROUTES.MAGIC_LOGIN, authController.magicLogin, {
		query: magicLoginQuery,
		detail: SW_ROUTE_DETAIL.MAGIC_LOGIN,
		response: {
			200: magicLoginRes,
			403: errorRes,
			404: errorRes,
			...errorsDefault,
		},
	})
	.post(AUTH_ROUTES.REGISTER, authController.register, {
		body: registerBody,
		detail: SW_ROUTE_DETAIL.REGISTER,
		response: {
			201: registerRes,
			409: errorRes,
			...errorsDefault,
		},
	})
	.post(AUTH_ROUTES.LOGIN, authController.login, {
		body: loginBody,
		detail: SW_ROUTE_DETAIL.LOGIN,
		response: {
			200: loginRes,
			403: errorRes,
			404: errorRes,
			...errorsDefault,
		},
	})
	.get(AUTH_ROUTES.CONFIRM_DEVICE, authController.confirmDevice, {
		query: confirmDeviceQuery,
		detail: SW_ROUTE_DETAIL.CONFIRM_DEVICE,
		response: {
			200: confirmDeviceRes,
			...errorsDefault,
		},
	})
	.use(isAuthenticated)
	.get(AUTH_ROUTES.LOGOUT, authController.logout, {
		detail: {
			...SW_ROUTE_DETAIL.LOGOUT,
			security: [{ accessToken: [] }],
		},
		response: {
			200: logoutRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	})
	.get(AUTH_ROUTES.LOGOUT_ALL, authController.logoutAll, {
		detail: {
			...SW_ROUTE_DETAIL.LOGOUT_ALL,
			security: [{ accessToken: [] }],
		},
		response: {
			200: logoutAllRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	})
	.get(AUTH_ROUTES.LOGOUT_DEVICE, authController.logoutDevice, {
		query: logoutDeviceQuery,
		detail: {
			...SW_ROUTE_DETAIL.LOGOUT_DEVICE,
			security: [{ accessToken: [] }],
		},
		response: {
			200: logoutDeviceRes,
			401: errorRes,
			403: errorRes,
			...errorsDefault,
		},
	});
