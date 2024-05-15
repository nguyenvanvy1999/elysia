import { faker } from "@faker-js/faker";
import { type AnyColumn, type TableConfig, sql } from "drizzle-orm";
import type {
	PgTableWithColumns,
	PgTransaction,
	QueryResultHKT,
} from "drizzle-orm/pg-core";
import { UniqueEnforcer } from "enforce-unique";

export async function cleanupDB<T extends TableConfig>(
	schema: PgTransaction<
		QueryResultHKT,
		Record<string, unknown>,
		Record<string, any>
	>,
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

export const increment = (column: AnyColumn, value = 1) => {
	return sql`${column} + ${value}`;
};

export const customCount = (column?: AnyColumn) => {
	if (column) {
		return sql<number>`cast(count(${column}) as integer)`;
	}
	return sql<number>`cast(count(*) as integer)`;
};

export const getCount = (data: { count: number }[]) => {
	return data[0]?.count ?? 0;
};
