import { eq, sql } from "drizzle-orm";
import { RES_KEY, USER_STATUS } from "src/common";
import { HttpError, config, db } from "src/config";
import { type UserWithRoles, users } from "src/db";
import { increment } from "src/util";

export const increasePasswordAttempt = async (
	userId: string,
): Promise<void> => {
	await db
		.update(users)
		.set({ passwordAttempt: increment(users.passwordAttempt, 1) })
		.where(eq(users.id, userId));
};

export const resetPasswordAttempt = async (userId: string): Promise<void> => {
	await db
		.update(users)
		.set({ passwordAttempt: config.passwordAttempt })
		.where(eq(users.id, userId));
};

export const checkUserStatus = (status: USER_STATUS | string): void => {
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
};

export const getUserDetail = async (
	userId: string,
): Promise<UserWithRoles | undefined> => {
	return (await db
		.execute(sql`SELECT "u"."id",
       "u"."name",
       "u"."username",
       "u"."email",
       "u"."email_verified",
       "u"."avatar_url",
       "u"."password",
       "u"."password_created",
       "u"."password_expired",
       "u"."password_attempt",
       "u"."password_salt",
       "u"."status",
       "u"."created_at",
       "u"."updated_at",
       "u"."active_account_token",
       "ur"."data" AS "roles"
FROM "user" "u"
LEFT JOIN LATERAL
  (SELECT coalesce(json_agg("utr"."data"), '[]'::JSON) AS "data"
   FROM "user_to_role" "ur"
   LEFT JOIN LATERAL
     (SELECT json_build_object('id', "r"."id", 'name', r."name", 'permissions', "ptr"."data") AS "data"
      FROM
        (SELECT r."id", r."name"
         FROM "role" "r"
         WHERE "r"."id" = "ur"."role_id"
         LIMIT 1) "r"
      LEFT JOIN LATERAL
        (SELECT coalesce(json_agg("p"."data"), '[]'::JSON) AS "data"
         FROM "permission_to_role" "ptr"
         LEFT JOIN LATERAL
           (SELECT json_build_object('action', p."action", 'entity', p."entity", 'access', p."access") AS "data"
            FROM
              (SELECT p."action", p."entity", p."access"
               FROM "permission" "p"
               WHERE "p"."id" = "ptr"."permission_id"
               LIMIT 1) "p") "p" ON TRUE
         WHERE "ptr"."role_id" = "r"."id") "ptr" ON TRUE) "utr" ON TRUE
   WHERE "ur"."user_id" = "u"."id") "ur" ON TRUE
WHERE "u"."id" = ${userId}
LIMIT 1;`)
		.then((res) => res.rows[0])) as UserWithRoles | undefined;
};
