import { type TSchema, t } from "elysia";

export const responseRes = <T extends TSchema>(T: T) =>
	t.Object({
		code: t.Number(),
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

export const errorRes = responseRes(t.Null());

export const errorsDefault = {
	400: errorRes,
	500: errorRes,
};
