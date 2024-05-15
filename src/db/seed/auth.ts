import {
	DB_ID_PREFIX,
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
	ROLE_NAME,
} from "src/common";
import { config, db, logger } from "src/config";
import {
	permissions,
	permissionsToRoles,
	refreshTokens,
	roles,
	users,
	usersToRoles,
} from "src/db/schemas";
import { cleanupDB, createPassword, createUser, dbIdGenerator } from "src/util";

async function main(): Promise<void> {
	logger.info("🌱 Seeding auth data...");
	await db.transaction(async (ct) => {
		await cleanupDB(ct, refreshTokens);
		await cleanupDB(ct, permissionsToRoles);
		await cleanupDB(ct, usersToRoles);
		await cleanupDB(ct, users);
		await cleanupDB(ct, roles);
		await cleanupDB(ct, permissions);
		logger.info("🧹 Cleaned up the database...");

		const permCreates = [];
		for (const entity of Object.values(POLICY_ENTITY)) {
			for (const action of Object.values(POLICY_ACTION)) {
				for (const access of Object.values(POLICY_ACCESS)) {
					permCreates.push({
						id: dbIdGenerator(DB_ID_PREFIX.PERMISSION),
						entity,
						action,
						access,
					});
				}
			}
		}
		await ct.insert(permissions).values(permCreates);
		logger.info("🔑 Created Permissions...");

		const permissionAdmin = permCreates.filter(
			(x) => x.access === POLICY_ACCESS.ANY,
		);
		const permissionUser = permCreates.filter(
			(x) =>
				x.access === POLICY_ACCESS.OWNER &&
				[POLICY_ENTITY.USER, POLICY_ENTITY.API_KEY].includes(x.entity),
		);
		const roleCreates = [
			{
				id: dbIdGenerator(DB_ID_PREFIX.ROLE),
				name: ROLE_NAME.USER,
			},
			{
				id: dbIdGenerator(DB_ID_PREFIX.ROLE),
				name: ROLE_NAME.ADMIN,
			},
		];
		const permissionsToRolesCreates = [];
		for (const { id } of permissionUser) {
			permissionsToRolesCreates.push({
				permissionId: id,
				roleId: roleCreates[0].id,
			});
		}
		for (const { id } of permissionAdmin) {
			permissionsToRolesCreates.push({
				permissionId: id,
				roleId: roleCreates[1].id,
			});
		}
		await Promise.all([
			ct.insert(roles).values(roleCreates),
			ct.insert(permissionsToRoles).values(permissionsToRolesCreates),
		]);
		logger.info("👑 Created roles...");

		const totalUsers: number = 3;
		const adminId = dbIdGenerator(DB_ID_PREFIX.USER);
		const userCreates = [
			{
				id: adminId,
				email: config.adminEmail,
				name: config.adminUsername,
				username: config.adminUsername,
				emailVerified: new Date(),
				...createPassword(config.adminPassword),
			},
		];
		const usersToRolesCreates = [
			{
				roleId: roleCreates[1].id,
				userId: adminId,
			},
		];
		for (let i = 0; i < totalUsers; i++) {
			const userData = createUser();
			const id = dbIdGenerator(DB_ID_PREFIX.USER);
			userCreates.push({
				id,
				...userData,
				emailVerified: new Date(),
				...createPassword(userData.username),
			});
			usersToRolesCreates.push({
				roleId: roleCreates[0].id,
				userId: id,
			});
		}
		await Promise.all([
			ct.insert(users).values(userCreates),
			ct.insert(usersToRoles).values(usersToRolesCreates),
		]);
		logger.info(`👤 Creating ${totalUsers} users and Admin`);
	});

	logger.info("🌱 Auth data has been seeded");
}

main()
	.catch((e): void => {
		logger.error(`Seeding error ${JSON.stringify(e)}`);
		process.exit(1);
	})
	.finally((): void => {
		logger.info("Seeding done!");
		process.exit(0);
	});
