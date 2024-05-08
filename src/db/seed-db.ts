import {
	DB_ID_PREFIX,
	POLICY_ACCESS,
	POLICY_ACTION,
	POLICY_ENTITY,
	ROLE_NAME,
	translates,
} from "src/common";
import { db, env } from "src/config";
import {
	permissions,
	permissionsToRoles,
	refreshTokens,
	roles,
	translations,
	users,
	usersToRoles,
} from "src/db/schemas";
import { cleanupDB, createPassword, createUser, dbIdGenerator } from "src/util";

export const seedAuthData = async (): Promise<void> => {
	console.log("🌱 Seeding auth data...");
	console.time("🌱 Auth data has been seeded");
	await db.transaction(async (ct) => {
		console.time("🧹 Cleaned up the database...");
		await cleanupDB(ct, refreshTokens);
		await cleanupDB(ct, permissionsToRoles);
		await cleanupDB(ct, usersToRoles);
		await cleanupDB(ct, users);
		await cleanupDB(ct, roles);
		await cleanupDB(ct, permissions);
		console.timeEnd("🧹 Cleaned up the database...");

		console.time("🔑 Created Permissions...");
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
		console.timeEnd("🔑 Created Permissions...");

		console.time("👑 Created roles...");
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
		console.timeEnd("👑 Created roles...");

		const totalUsers: number = 3;
		console.time(`👤 Creating ${totalUsers} users and Admin`);
		const adminId = dbIdGenerator(DB_ID_PREFIX.USER);
		const userCreates = [
			{
				id: adminId,
				email: env.adminEmail,
				name: env.adminUsername,
				username: env.adminUsername,
				emailVerified: new Date(),
				...createPassword(env.adminPassword),
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
		console.timeEnd(`👤 Creating ${totalUsers} users and Admin`);
	});

	console.timeEnd("🌱 Auth data has been seeded");
};

export const seedTranslationsData = async (): Promise<void> => {
	console.log("🌱 Seeding auth data...");
	console.time("🌱 Auth data has been seeded");
	await db.transaction(async (ct) => {
		console.time("🧹 Cleaned up the database...");
		await cleanupDB(ct, translations);
		console.timeEnd("🧹 Cleaned up the database...");

		console.time("Created Translations...");

		await ct.insert(translations).values(translates);
		console.timeEnd("Created Translations...");
	});

	console.timeEnd("🌱 Auth data has been seeded");
};
