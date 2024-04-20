import { relations } from "drizzle-orm";
import {
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { DB_TABLE_NAME } from "src/common";

export const users = pgTable(DB_TABLE_NAME.USER, {
	id: varchar("id", { length: 32 }).notNull().primaryKey(),
	name: text("name"),
	username: text("username").unique().notNull(),
	email: text("email").unique().notNull(),
	emailVerified: timestamp("email_verified", { mode: "date" }),
	image: text("image"),
	password: varchar("password", { length: 256 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
	roles: many(usersToRoles),
	refreshTokens: many(refreshTokens),
}));

export const refreshTokens = pgTable(
	DB_TABLE_NAME.REFRESH_TOKEN,
	{
		id: varchar("id", { length: 32 }).notNull().primaryKey(),
		userId: varchar("id", { length: 32 }).notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.id, vt.token, vt.userId] }),
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
