import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import ms from "ms";
import { ID_PREFIX, type IJwtPayload, RES_KEY, USER_STATUS } from "src/common";
import { HttpError, config, db, sessionRepository } from "src/config";
import { type UserWithRoles, refreshTokens, users } from "src/db";
import {
	aes256Encrypt,
	createAccessToken,
	createRefreshToken,
	idGenerator,
	increment,
} from "src/util";

interface IUserService {
	increasePasswordAttempt: (userId: string) => Promise<void>;
	resetPasswordAttempt: (userId: string) => Promise<void>;
	checkUserStatus: (status: USER_STATUS | string) => void;
	getUserDetail: (userId: string) => Promise<UserWithRoles | undefined>;
	generateAndSaveTokens: (userId: string) => Promise<{
		accessToken: string;
		refreshToken: string;
		accessSessionId: string;
		refreshSessionId: string;
	}>;
}

export const userService: IUserService = {
	generateAndSaveTokens: async (
		userId: string,
	): Promise<{
		accessToken: string;
		refreshToken: string;
		accessSessionId: string;
		refreshSessionId: string;
	}> => {
		const accessSessionId: string = idGenerator(ID_PREFIX.SESSION);
		const refreshSessionId: string = randomUUID();
		let accessToken: string = createAccessToken({
			loginDate: new Date(),
			sessionId: accessSessionId,
			refreshSessionId,
		} satisfies IJwtPayload);
		let refreshToken: string = createRefreshToken({
			loginDate: new Date(),
			sessionId: refreshSessionId,
		} satisfies IJwtPayload);
		if (config.enbTokenEncrypt) {
			accessToken = aes256Encrypt(
				accessToken,
				config.jwtPayloadAccessTokenEncryptKey,
				config.jwtPayloadAccessTokenEncryptIv,
			);
			refreshToken = aes256Encrypt(
				refreshToken,
				config.jwtPayloadRefreshTokenEncryptKey,
				config.jwtPayloadRefreshTokenEncryptIv,
			);
		}

		await Promise.all([
			db.insert(refreshTokens).values({
				id: idGenerator(ID_PREFIX.REFRESH_TOKEN),
				userId,
				token: refreshSessionId,
				expires: new Date(Date.now() + ms(config.jwtRefreshTokenExpired)),
			}),
			sessionRepository.save(accessSessionId, {
				id: accessSessionId,
				userId,
				refreshSessionId,
			}),
		]);
		await sessionRepository.expireAt(
			accessSessionId,
			new Date(Date.now() + ms(config.jwtAccessTokenExpired)),
		);

		return {
			accessToken,
			refreshToken,
			accessSessionId,
			refreshSessionId,
		};
	},

	increasePasswordAttempt: async (userId: string): Promise<void> => {
		await db
			.update(users)
			.set({ passwordAttempt: increment(users.passwordAttempt, 1) })
			.where(eq(users.id, userId));
	},

	resetPasswordAttempt: async (userId: string): Promise<void> => {
		await db
			.update(users)
			.set({ passwordAttempt: 0 })
			.where(eq(users.id, userId));
	},

	checkUserStatus: (status: USER_STATUS | string): void => {
		switch (status) {
			case USER_STATUS.INACTIVE:
				throw HttpError.Forbidden(...Object.values(RES_KEY.USER_INACTIVE));
			case USER_STATUS.INACTIVE_PERMANENT:
				throw HttpError.Forbidden(
					...Object.values(RES_KEY.USER_INACTIVE_PERMANENT),
				);
			case USER_STATUS.BLOCK:
				throw HttpError.Forbidden(...Object.values(RES_KEY.USER_BLOCKED));
			default:
				break;
		}
	},

	getUserDetail: async (userId: string): Promise<UserWithRoles | undefined> => {
		return (await db
			.execute(sql`SELECT "u".*, "ur"."data" AS "roles"
FROM "user" "u"
         LEFT JOIN LATERAL
    (SELECT coalesce(json_agg("utr"."data"), '[]'::JSON) AS "data"
     FROM "user_to_role" "ur"
              LEFT JOIN LATERAL
         (SELECT json_build_object('id', "r"."id", 'name', r."name", 'permissions', "ptr"."data") AS "data"
          FROM (SELECT r."id", r."name"
                FROM "role" "r"
                WHERE "r"."id" = "ur"."role_id"
                LIMIT 1) "r"
                   LEFT JOIN LATERAL
              (SELECT coalesce(json_agg("p"."data"), '[]'::JSON) AS "data"
               FROM "permission_to_role" "ptr"
                        LEFT JOIN LATERAL
                   (SELECT json_build_object('action', p."action", 'entity', p."entity", 'access', p."access") AS "data"
                    FROM (SELECT p."action", p."entity", p."access"
                          FROM "permission" "p"
                          WHERE "p"."id" = "ptr"."permission_id"
                          LIMIT 1) "p") "p" ON TRUE
               WHERE "ptr"."role_id" = "r"."id") "ptr" ON TRUE) "utr" ON TRUE
     WHERE "ur"."user_id" = "u"."id") "ur" ON TRUE
WHERE "u"."id" = ${userId}
LIMIT 1;`)
			.then((res) => res.rows[0])) as UserWithRoles | undefined;
	},
};
