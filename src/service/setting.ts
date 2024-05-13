import dayjs from "dayjs";
import { SETTING_DATA_TYPE } from "src/common";
import type { Setting } from "src/db";
import { checkJSONString, checkNumber, decryptSetting } from "src/util";

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
	if (type === SETTING_DATA_TYPE.DATE && dayjs(value).isValid()) {
		return true;
	}
	if (type === SETTING_DATA_TYPE.JSON && checkJSONString(value)) {
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
		value = decryptSetting(value);
	}
	if (
		setting.type === SETTING_DATA_TYPE.BOOLEAN &&
		(value === "true" || value === "false")
	) {
		return (value === "true") as T;
	}
	if (setting.type === SETTING_DATA_TYPE.NUMBER && checkNumber(value)) {
		return Number(value) as T;
	}
	if (setting.type === SETTING_DATA_TYPE.JSON) {
		return JSON.parse(value);
	}
	if (setting.type === SETTING_DATA_TYPE.DATE) {
		return new Date(value) as T;
	}

	return value as T;
};
