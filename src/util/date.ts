import dayjs from "dayjs";

export const forwardInSeconds = (seconds: number, fromDate?: Date): Date => {
	return dayjs(fromDate).add(seconds, "seconds").toDate();
};

export const forwardInMilliSeconds = (ms: number, fromDate?: Date): Date => {
	return dayjs(fromDate).add(ms, "milliseconds").toDate();
};
