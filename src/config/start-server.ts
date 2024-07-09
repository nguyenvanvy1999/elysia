import { inArray } from "drizzle-orm";
import {
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
	ROLE_NAME,
	SETTING_KEY,
} from "src/common";
import { db } from "src/config/db";
import { permissionRepository, redisClient } from "src/config/redis";
import { roles, settings } from "src/db";
import { settingService } from "src/service";

export const ensureSettings = async (): Promise<void> => {
	const ensureKeys: string[] = Object.values(SETTING_KEY);
	const configs = await db.query.settings.findMany({
		where: inArray(settings.key, ensureKeys),
	});
	const missingSettings: string[] = ensureKeys.filter(
		(a) => !configs.some((x) => x.key === a),
	);
	if (missingSettings.length) {
		throw new Error(
			`Missing these settings ${missingSettings.join(
				", ",
			)} from DB. please run db:seed:setting to add it`,
		);
	}

	// cache settings
	await redisClient.mSet(
		configs.reduce(
			(prev, cur) =>
				Object.assign(prev, { [cur.key]: settingService.getValue(cur, true) }),
			{},
		),
	);
};

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

export const ensurePermissions = async (): Promise<void> => {
	const totalPermissions = [];
	for (const entity of Object.values(POLICY_ENTITY)) {
		for (const action of Object.values(POLICY_ACTION)) {
			for (const access of Object.values(POLICY_ACCESS)) {
				totalPermissions.push({
					entity,
					action,
					access,
				});
			}
		}
	}
	const permissions = await db.query.permissions.findMany({
		columns: { id: true, entity: true, access: true, action: true },
	});

	const missingPermissions: {
		entity: string;
		access: string;
		action: string;
	}[] = totalPermissions.filter(
		(a) =>
			!permissions.some(
				(x) =>
					x.entity !== a.entity &&
					x.action !== a.action &&
					x.access !== a.access,
			),
	);
	if (missingPermissions.length) {
		throw new Error(
			`Missing these permissions ${missingPermissions.join(
				", ",
			)} from DB. please run db:seed:auth to add it`,
		);
	}

	// cache permissions
	await Promise.allSettled(
		permissions.map((x) => permissionRepository.save(x.id, x)),
	);
};
