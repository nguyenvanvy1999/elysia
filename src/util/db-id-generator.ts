import { nanoid } from "nanoid";
import { NANO_ID_ALPHABET, NANO_ID_LENGTH } from "src/common";

export const dbIdGenerator = (prefix = ""): string => {
	const { customAlphabet } = require("nanoid");
	const nanoid = customAlphabet(NANO_ID_ALPHABET, NANO_ID_LENGTH);
	return `${prefix}_${nanoid()}`;
};