import { t } from "elysia";
import { LOGIN_METHOD } from "src/common/constants";

export const deviceDto = t.Object({
	id: t.String(),
	userId: t.String(),
	sessionId: t.Optional(t.String()),
	type: t.Optional(t.String()),
	vendor: t.Optional(t.String()),
	model: t.Optional(t.String()),
	os: t.Optional(t.String()),
	osVersion: t.Optional(t.String()),
	ua: t.Optional(t.String()),
	browserName: t.Optional(t.String()),
	browserVersion: t.Optional(t.String()),
	engineName: t.Optional(t.String()),
	engineVersion: t.Optional(t.String()),
	cpuArchitecture: t.Optional(t.String()),
	createdAt: t.Date(),
	loginAt: t.Optional(t.Date()),
	logoutAt: t.Optional(t.Date()),
	location: t.Optional(t.Object({ lat: t.Number(), lng: t.Number() })),
	loginMethod: t.Enum(LOGIN_METHOD),
	address: t.Optional(t.String()),
});
