import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";
import { settingDto } from "src/common/dtos/setting/setting";

export const createSettingBody = t.Omit(settingDto, ["id"]);

export const settingRes = resDoc(settingDto);
