import { eq } from "drizzle-orm";
import type { Elysia } from "elysia";
import {
	HEADER_KEY,
	type IJwtPayload,
	type ISession,
	RES_KEY,
} from "src/common";
import { type HttpError, db, sessionRepository } from "src/config";
import { users } from "src/db";
import { checkUserStatus } from "src/service";
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
	app.derive(async ({ request: { headers }, HttpError }) => {
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
		const user = await db.query.users.findFirst({
			where: eq(users.id, session.userId),
		});
		if (!user) {
			throw HttpError.NotFound(...Object.values(RES_KEY.USER_NOT_FOUND));
		}
		checkUserStatus(user.status);
		return { user };
	});
