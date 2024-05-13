export const checkNumber = (number: string): boolean => {
	const regex: RegExp = /^-?\d+$/;
	return regex.test(number);
};
