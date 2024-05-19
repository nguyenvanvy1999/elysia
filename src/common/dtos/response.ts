import { type TSchema, t } from "elysia";

export const resDoc = <T extends TSchema>(T: T) =>
	t.Object({
		code: t.String(),
		message: t.String(),
		metadata: t.Optional(
			t.Object({
				languages: t.Array(t.String()),
				timestamp: t.Number(),
				timezone: t.String(),
				requestId: t.String(),
				url: t.String(),
				method: t.String(),
				version: t.String(),
				repoVersion: t.String(),
			}),
		),
		data: t.Optional(T),
	});

export const resPagingDoc = <T extends TSchema>(T: T) =>
	t.Intersect([
		resDoc(T),
		t.Optional(
			t.Object({
				currentPageCount: t.Integer(),
				totalItems: t.Integer(),
				totalPages: t.Integer(),
				currentPage: t.Integer(),
			}),
		),
	]);

export const errorRes = resDoc(t.Null());

export const errorsDefault = {
	400: errorRes,
	500: errorRes,
};
