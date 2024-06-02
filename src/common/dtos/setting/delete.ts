import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";
import { settingDto } from "src/common/dtos/setting/setting";

export const deleteSettingRes = resDoc(t.Pick(settingDto, ["id"]));
