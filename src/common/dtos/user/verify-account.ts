import { t } from "elysia";
import { resDoc } from "src/common/dtos/response";

export const verifyAccountQuery = t.Object({ token: t.String() });

export const verifyAccountRes = resDoc(t.Null());
