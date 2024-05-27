import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";

export const confirmDeviceQuery = t.Object({ token: t.String() });

export const confirmDeviceRes = resDoc(t.Null());
