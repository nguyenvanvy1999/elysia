import { customAlphabet } from "nanoid";
import { NANO_ID_ALPHABET, NANO_ID_LENGTH } from "src/common";

export const dbIdGenerator = (
	prefix = "",
	idLength = NANO_ID_LENGTH,
): string => {
	const nanoid = customAlphabet(NANO_ID_ALPHABET, idLength);
	return prefix.length ? `${prefix}_${nanoid()}` : nanoid();
};
