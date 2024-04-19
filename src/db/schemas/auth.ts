import { relations } from "drizzle-orm";
import {
	integer,
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
}));

export const accounts = pgTable(
	DB_TABLE_NAME.ACCOUNT,
	{
		userId: varchar("user_id", { length: 32 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("provider_account_id").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
	}),
);

export const verificationTokens = pgTable(
	DB_TABLE_NAME.VERIFICATION_TOKEN,
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
	}),
);

export const role = pgTable(DB_TABLE_NAME.ROLE, {
	id: varchar("id", { length: 32 }).primaryKey(),
	name: varchar("name", { length: 256 }).unique().notNull(),
	description: text("description").default(""),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const roleRelations = relations(role, ({ many }) => ({
	users: many(usersToRoles),
	permissions: many(permissionsToRoles),
}));

export const usersToRoles = pgTable(
	DB_TABLE_NAME.USER_TO_ROLE,
	{
		roleId: varchar("role_id", { length: 32 })
			.notNull()
			.references(() => role.id, { onDelete: "cascade" }),
		userId: varchar("user_id", { length: 32 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.roleId, t.userId] }),
	}),
);

export const usersToRolesRelations = relations(usersToRoles, ({ one }) => ({
	role: one(role, {
		fields: [usersToRoles.roleId],
		references: [role.id],
	}),
	user: one(users, {
		fields: [usersToRoles.userId],
		references: [users.id],
	}),
}));

export const permission = pgTable(
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

export const permissionRelations = relations(permission, ({ many }) => ({
	roles: many(permissionsToRoles),
}));

export const permissionsToRoles = pgTable(
	DB_TABLE_NAME.PERMISSION_TO_ROLE,
	{
		roleId: varchar("role_id", { length: 32 })
			.notNull()
			.references(() => role.id, { onDelete: "cascade" }),
		permissionId: varchar("permission_id", { length: 32 })
			.notNull()
			.references(() => permission.id, { onDelete: "cascade" }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
	}),
);

export const permissionsToRolesRelations = relations(
	permissionsToRoles,
	({ one }) => ({
		role: one(role, {
			fields: [permissionsToRoles.roleId],
			references: [role.id],
		}),
		permission: one(permission, {
			fields: [permissionsToRoles.permissionId],
			references: [permission.id],
		}),
	}),
);
