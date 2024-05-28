import { t } from "elysia";
import { settingDto } from "src/common/dtos/setting/setting";

export const updateSettingBody = t.Composite([
	t.Omit(settingDto, ["id", "key"]),
	t.Partial(
		t.Object({
			isSetCache: t.Boolean({ default: false }),
		}),
	),
]);
