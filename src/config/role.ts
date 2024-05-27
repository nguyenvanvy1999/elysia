import { inArray } from "drizzle-orm";
import { ROLE_NAME } from "src/common";
import { db } from "src/config/db";
import { roles } from "src/db";

export const ensureRoles = async (): Promise<void> => {
	const ensureRoles: string[] = Object.values(ROLE_NAME);
	const allRoles = await db.query.roles.findMany({
		where: inArray(roles.name, ensureRoles),
		columns: { name: true },
	});
	const missingRoles: string[] = ensureRoles.filter(
		(a) => !allRoles.some((x) => x.name === a),
	);
	if (missingRoles.length) {
		throw new Error(
			`Missing these roles ${missingRoles.join(
				", ",
			)} from DB. please run db:seed:auth to add it`,
		);
	}
};
