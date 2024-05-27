import { Elysia } from "elysia";
import {
	ROUTES,
	SW_ROUTE_DETAIL,
	USER_ROUTES,
	errorRes,
	errorsDefault,
	sendEmailVerifyBody,
	sendEmailVerifyRes,
	swaggerOptions,
	userInfoRes,
	verifyAccountQuery,
	verifyAccountRes,
} from "src/common";
import { userController } from "src/controller";
import { isAuthenticated } from "src/middleware";

export const userRoutes = new Elysia({
	prefix: ROUTES.USER_V1,
	detail: { tags: [swaggerOptions.tags.user.name] },
})
	.post(USER_ROUTES.SEND_EMAIL_VERIFY, userController.sendEmailVerifyAccount, {
		body: sendEmailVerifyBody,
		detail: SW_ROUTE_DETAIL.SEND_EMAIL_VERIFY,
		response: {
			200: sendEmailVerifyRes,
			404: errorRes,
			...errorsDefault,
		},
	})
	.get(USER_ROUTES.ACTIVE_ACCOUNT, userController.activeAccount, {
		query: verifyAccountQuery,
		detail: SW_ROUTE_DETAIL.VERIFY_ACCOUNT,
		response: {
			200: verifyAccountRes,
			404: errorRes,
			...errorsDefault,
		},
	})
	.use(isAuthenticated)
	.get(USER_ROUTES.INFO, userController.userInfo, {
		detail: {
			...SW_ROUTE_DETAIL.USER_INFO,
			security: [{ accessToken: [] }],
		},
		response: {
			200: userInfoRes,
			401: errorRes,
			...errorsDefault,
		},
	});
