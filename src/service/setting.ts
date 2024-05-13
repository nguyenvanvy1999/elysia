import { SETTING_DATA_TYPE } from "src/common";
import type { Setting } from "src/db";
import { checkNumber } from "src/util";

export const checkValue = (value: string, type: SETTING_DATA_TYPE): boolean => {
	if (
		type === SETTING_DATA_TYPE.BOOLEAN &&
		(value === "true" || value === "false")
	) {
		return true;
	}
	if (type === SETTING_DATA_TYPE.NUMBER && checkNumber(value)) {
		return true;
	}
	return type === SETTING_DATA_TYPE.STRING;
};

export const getValue = <T>(setting: Setting): T | undefined => {
	if (!setting) {
		return;
	}
	let value: string = setting.value;
	if (setting.isEncrypt) {
		value = "";
	}

	if (
		setting.type === SETTING_DATA_TYPE.BOOLEAN &&
		(value === "true" || value === "false")
	) {
		return (value === "true") as any;
	}
	if (setting.type === SETTING_DATA_TYPE.NUMBER && checkNumber(value)) {
		return Number(value) as any;
	}
	if (setting.type === SETTING_DATA_TYPE.JSON) {
		return value.split(",") as any;
	}

	return value as T;
};
