import { t } from "elysia";
import { settingDto } from "src/common/dtos/setting/setting";

export const createSettingBody = t.Omit(settingDto, ["id"]);
