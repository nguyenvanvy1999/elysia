import { t } from "elysia";
import { SETTING_DATA_TYPE } from "src/common/constants";

export const settingDto = t.Object({
	id: t.String(),
	key: t.String(),
	isEncrypt: t.Boolean({ default: false }),
	description: t.Optional(t.String()),
	type: t.Enum(SETTING_DATA_TYPE),
	value: t.Union([
		t.String(),
		t.Boolean(),
		t.Date(),
		t.Number(),
		t.Record(t.String(), t.Any()),
	]),
});
