import { t } from "elysia";
import { settingDto } from "src/common/dtos/setting/setting";

export const updateSettingBody = t.Omit(settingDto, ["id", "key"]);
