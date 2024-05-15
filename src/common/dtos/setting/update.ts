import { t } from "elysia";
import { settingDto } from "src/common/dtos/setting/setting";

export const updateSettingBody = t.Intersect([
	t.Omit(settingDto, ["id", "key"]),
	t.Partial(
		t.Object({
			isReloadApp: t.Boolean({ default: false }),
			isSetCache: t.Boolean({ default: false }),
		}),
	),
]);
