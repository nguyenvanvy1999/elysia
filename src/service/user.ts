import { eq } from "drizzle-orm";
import { db } from "src/config";
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
