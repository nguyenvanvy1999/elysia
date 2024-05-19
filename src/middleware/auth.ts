import type { Elysia } from "elysia";
import {
	HEADER_KEY,
	type IJwtPayload,
	type IPolicyAbility,
	type IPolicyRule,
	type ISession,
	type PolicyHandler,
	RES_KEY,
	type ROLE_NAME,
} from "src/common";
import { HttpError, sessionRepository } from "src/config";
import type { UserWithRoles } from "src/db";
import {
	checkUserStatus,
	defineAbilityFromRole,
	execPolicyHandler,
	getUserDetail,
	handlerRules,
} from "src/service";
import { verifyAccessToken } from "src/util";

export const isAuthenticated = (
	app: Elysia<
		"",
		false,
		{
			derive: Record<string, unknown>;
			decorator: { HttpError: typeof HttpError };
			store: Record<string, unknown>;
			resolve: Record<string, unknown>;
		}
	>,
) =>
	app.derive(async ({ request: { headers } }) => {
		const authorization: string | null = headers.get(HEADER_KEY.AUTHORIZATION);
		if (!authorization) {
			throw HttpError.Unauthorized(...Object.values(RES_KEY.TOKEN_EMPTY));
		}
		const token: string = authorization.split(" ")[1];
		if (!token) {
			throw HttpError.Unauthorized(...Object.values(RES_KEY.TOKEN_EMPTY));
		}
		let payload: IJwtPayload;
		try {
			payload = verifyAccessToken(token);
		} catch (e: any) {
			if (e?.name === "TokenExpiredError") {
				throw HttpError.Unauthorized(...Object.values(RES_KEY.TOKEN_EXPIRED));
			}
			throw HttpError.Unauthorized(...Object.values(RES_KEY.WRONG_TOKEN));
		}
		if (!payload?.sessionId) {
			throw HttpError.Unauthorized(...Object.values(RES_KEY.WRONG_TOKEN));
		}
		const session: ISession = (await sessionRepository.fetch(
			payload.sessionId,
		)) as ISession;
		if (!session.userId) {
			throw HttpError.Unauthorized(...Object.values(RES_KEY.TOKEN_EXPIRED));
		}
		const user: UserWithRoles | undefined = await getUserDetail(session.userId);
		if (!user) {
			throw HttpError.NotFound(...Object.values(RES_KEY.USER_NOT_FOUND));
		}
		checkUserStatus(user.status);
		return { user, sessionId: payload.sessionId };
	});

export const hasPermissions = (
	policyRule: IPolicyRule[],
): (({ user }: { user: UserWithRoles }) => void) => {
	return ({ user }) => {
		let check = false;
		for (const role of user.roles) {
			const ability: IPolicyAbility = defineAbilityFromRole({
				name: role.name as ROLE_NAME,
				permissions: role.permissions as IPolicyRule[],
			});
			const policyHandler: PolicyHandler[] = handlerRules(policyRule);
			if (
				policyHandler.every((handler: PolicyHandler) => {
					return execPolicyHandler(handler, ability);
				})
			) {
				check = true;
			}
		}
		if (!check) {
			throw HttpError.Forbidden(...Object.values(RES_KEY.ABILITY_FORBIDDEN));
		}
	};
};
