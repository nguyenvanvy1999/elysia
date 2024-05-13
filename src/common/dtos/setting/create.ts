import { t } from "elysia";
import { responseRes } from "src/common/dtos/response";
import { settingDto } from "src/common/dtos/setting/setting";

export const createSettingBody = t.Omit(settingDto, ["id"]);

export const settingRes = responseRes(settingDto);
