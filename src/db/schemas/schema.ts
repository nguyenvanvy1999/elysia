import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { DB_TABLE_NAME, USER_STATUS } from "src/common";

export const userStatusEnum = pgEnum("user_status_enum", [
	"active",
	"inactive",
	"inactive_permanent",
	"block",
]);

export const users = pgTable(DB_TABLE_NAME.USER, {
	id: varchar("id", { length: 32 }).notNull().primaryKey(),
	name: text("name"),
	username: text("username").unique().notNull(),
	email: text("email").unique().notNull(),
	emailVerified: timestamp("email_verified", { mode: "date" }),
	avatarUrl: text("avatar_url"),
	password: varchar("password", { length: 256 }).notNull(),
	passwordCreated: timestamp("password_created").notNull(),
	passwordExpired: timestamp("password_expired").notNull(),
	passwordAttempt: integer("password_attempt").notNull(),
	passwordSalt: varchar("password_salt").notNull(),
	status: userStatusEnum("status").notNull().default(USER_STATUS.ACTIVE),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	activeAccountToken: varchar("active_account_token"),
});

export const userRelations = relations(users, ({ many }) => ({
	roles: many(usersToRoles),
	refreshTokens: many(refreshTokens),
}));

export const refreshTokens = pgTable(
	DB_TABLE_NAME.REFRESH_TOKEN,
	{
		id: varchar("id", { length: 32 }).notNull().primaryKey(),
		userId: varchar("user_id", { length: 32 }).notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(vt) => ({
		userIdIdx: index("refresh_token_user_idx").on(vt.userId),
		tokenIdx: index("refresh_token_token_idx").on(vt.token),
	}),
);

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.id],
	}),
}));

export const roles = pgTable(DB_TABLE_NAME.ROLE, {
	id: varchar("id", { length: 32 }).primaryKey(),
	name: varchar("name", { length: 256 }).unique().notNull(),
	description: text("description").default(""),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const roleRelations = relations(roles, ({ many }) => ({
	users: many(usersToRoles),
	permissions: many(permissionsToRoles),
}));

export const usersToRoles = pgTable(
	DB_TABLE_NAME.USER_TO_ROLE,
	{
		roleId: varchar("role_id", { length: 32 })
			.notNull()
			.references(() => roles.id, { onDelete: "cascade" }),
		userId: varchar("user_id", { length: 32 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.roleId, t.userId] }),
	}),
);

export const usersToRolesRelations = relations(usersToRoles, ({ one }) => ({
	role: one(roles, {
		fields: [usersToRoles.roleId],
		references: [roles.id],
	}),
	user: one(users, {
		fields: [usersToRoles.userId],
		references: [users.id],
	}),
}));

export const permissions = pgTable(
	DB_TABLE_NAME.PERMISSION,
	{
		id: varchar("id", { length: 32 }).primaryKey(),
		action: varchar("action", { length: 256 }).notNull(),
		entity: varchar("entity", { length: 256 }).notNull(),
		access: varchar("access", { length: 256 }).notNull(),
		description: text("description").default(""),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(t) => ({
		unq: unique().on(t.action, t.entity, t.access),
	}),
);

export const permissionRelations = relations(permissions, ({ many }) => ({
	roles: many(permissionsToRoles),
}));

export const permissionsToRoles = pgTable(
	DB_TABLE_NAME.PERMISSION_TO_ROLE,
	{
		roleId: varchar("role_id", { length: 32 })
			.notNull()
			.references(() => roles.id, { onDelete: "cascade" }),
		permissionId: varchar("permission_id", { length: 32 })
			.notNull()
			.references(() => permissions.id, { onDelete: "cascade" }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
	}),
);

export const permissionsToRolesRelations = relations(
	permissionsToRoles,
	({ one }) => ({
		role: one(roles, {
			fields: [permissionsToRoles.roleId],
			references: [roles.id],
		}),
		permission: one(permissions, {
			fields: [permissionsToRoles.permissionId],
			references: [permissions.id],
		}),
	}),
);

export const translations = pgTable(
	DB_TABLE_NAME.TRANSLATION,
	{
		lang: text("lang").notNull(),
		ns: text("ns").notNull(),
		key: text("key").notNull(),
		value: text("value").notNull(),
	},
	(vt) => ({
		langIdx: index("translation_lang_idx").on(vt.lang),
		nsIdx: index("translation_ns_idx").on(vt.ns),
		keyIdx: index("translation_key_idx").on(vt.key),
	}),
);

export const settingTypeEnum = pgEnum("setting_type_enum", [
	"string",
	"number",
	"boolean",
	"json",
	"date",
]);

export const settings = pgTable(DB_TABLE_NAME.SETTING, {
	id: varchar("id", { length: 32 }).notNull().primaryKey(),
	key: text("key").unique().notNull(),
	isEncrypt: boolean("is_encrypted").default(false),
	description: text("description"),
	type: settingTypeEnum("type").notNull(),
	value: varchar("value", { length: 2048 }).notNull(),
});

export type Setting = InferSelectModel<typeof settings>;
