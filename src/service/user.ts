import { eq } from "drizzle-orm";
import { RES_KEY, USER_STATUS } from "src/common";
import { HttpError, db } from "src/config";
import { users } from "src/db";
import { increment } from "src/util";

export const increasePasswordAttempt = async (
	userId: string,
): Promise<void> => {
	await db
		.update(users)
		.set({ passwordAttempt: increment(users.passwordAttempt, 1) })
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
