import camelcaseKeys from "camelcase-keys";
import { z } from "zod";

/**
 * Toggle environment variables
 * 'true' or '1' will evaluate to true
 * 'false' or '0' will evaluate to false
 */
export const toggle = z
	.enum(["true", "false", "0", "1"])
	.transform((v) => v === "true" || v === "1");

export const camelize = <T extends Record<string, unknown>>(val: T) =>
	camelcaseKeys(val);
