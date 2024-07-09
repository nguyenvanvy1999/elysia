import { randomUUID } from "node:crypto";
import { eq, getTableColumns } from "drizzle-orm";
import ms from "ms";
import { ID_PREFIX, type IJwtPayload, RES_KEY, USER_STATUS } from "src/common";
import { HttpError, config, db, sessionRepository } from "src/config";
import {
	type UserWithRoles,
	permissions,
	permissionsToRoles,
	refreshTokens,
	roles,
	users,
	usersToRoles,
} from "src/db";
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
		const usersRes = await db
			.select({
				user: getTableColumns(users),
				role: {
					id: roles.id,
					name: roles.name,
					description: roles.description,
				},
				permission: {
					id: permissions.id,
					access: permissions.access,
					entity: permissions.entity,
					action: permissions.action,
				},
			})
			.from(users)
			.innerJoin(usersToRoles, eq(users.id, usersToRoles.userId))
			.innerJoin(roles, eq(roles.id, usersToRoles.roleId))
			.innerJoin(
				permissionsToRoles,
				eq(permissionsToRoles.roleId, usersToRoles.roleId),
			)
			.innerJoin(
				permissions,
				eq(permissionsToRoles.permissionId, permissions.id),
			)
			.where(eq(users.id, userId));
		if (!usersRes.length) {
			return;
		}

		const setRoleIds: Map<string, any> = new Map<string, any>();
		for (const i of usersRes) {
			const exist = setRoleIds.get(i.role.id);
			if (!exist) {
				setRoleIds.set(i.role.id, {
					...i.role,
					permissions: [i.permission],
				});
			} else {
				setRoleIds.set(i.role.id, {
					...i.role,
					permissions: [...exist.permissions, i.permission],
				});
			}
		}

		return {
			...usersRes[0].user,
			roles: Array.from(setRoleIds.values()),
		};
	},
};
