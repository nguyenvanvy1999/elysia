import { faker } from "@faker-js/faker";
import type { TableConfig } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { UniqueEnforcer } from "enforce-unique";

export async function cleanupDB<T extends TableConfig>(
	schema: PostgresJsDatabase<Record<string, unknown>>,
	table: PgTableWithColumns<T>,
): Promise<void> {
	await schema.delete(table);
}

const uniqueUsernameEnforcer = new UniqueEnforcer();
export function createUser() {
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();

	const username = uniqueUsernameEnforcer
		.enforce(() => {
			return `${faker.string.alphanumeric({
				length: 2,
			})}_${faker.internet.userName({
				firstName: firstName.toLowerCase(),
				lastName: lastName.toLowerCase(),
			})}`;
		})
		.slice(0, 20)
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, "_");

	return {
		username,
		name: `${firstName} ${lastName}`,
		email: faker.internet.email({ firstName, lastName }).toLowerCase(),
	};
}