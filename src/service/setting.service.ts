import dayjs from "dayjs";
import { SETTING_DATA_TYPE, SETTING_KEY } from "src/common";
import type { Setting } from "src/db";
import { checkJSONString, checkNumber, decryptSetting } from "src/util";

type ISettingService = {
	checkValue: (value: string, type: SETTING_DATA_TYPE) => boolean;
	stringifyValue: (
		value:
			| string
			| boolean
			| number
			| Date
			| Record<string, any>
			| Record<string, any>[],
	) => string;
	isProtected: (key: string) => boolean;
	getValue: <T>(setting: Setting, raw?: boolean) => T;
};

export const settingService: ISettingService = {
	checkValue: (value: string, type: SETTING_DATA_TYPE): boolean => {
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
	},

	stringifyValue: (
		value:
			| string
			| boolean
			| number
			| Date
			| Record<string, any>
			| Record<string, any>[],
	): string => {
		return typeof value === "object" ? JSON.stringify(value) : value.toString();
	},

	isProtected: (key: string): boolean => {
		return Object.values<string>(SETTING_KEY).includes(key);
	},

	getValue: <T>(setting: Setting, raw = false): T => {
		let value: string = setting.value;
		if (setting.isEncrypt) {
			value = decryptSetting(value);
		}
		if (raw) {
			return value as T;
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
	},
};
