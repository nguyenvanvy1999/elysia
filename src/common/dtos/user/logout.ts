import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";

export const logoutRes = resDoc(t.Null());

export const logoutAllRes = resDoc(t.Null());

export const logoutDeviceRes = resDoc(t.Null());

export const logoutDeviceQuery = t.Object({ deviceId: t.String() });
