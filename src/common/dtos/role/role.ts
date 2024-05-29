import { t } from "elysia";

export const roleDto = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.Optional(t.String()),
	createdAt: t.Date(),
	updatedAt: t.Date(),
});
