export const checkNumber = (str: string): boolean => {
	return !Number.isNaN(str) && !Number.isNaN(Number.parseFloat(str));
};

export function checkJSONString(str: string): boolean {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
