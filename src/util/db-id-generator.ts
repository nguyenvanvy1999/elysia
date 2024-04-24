import { customAlphabet } from "nanoid";
import { NANO_ID_ALPHABET, NANO_ID_LENGTH } from "src/common";

export const dbIdGenerator = (prefix = ""): string => {
	const nanoid = customAlphabet(NANO_ID_ALPHABET, NANO_ID_LENGTH);
	return prefix.length ? `${prefix}_${nanoid()}` : nanoid();
};
