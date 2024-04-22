import dayjs from "dayjs";

export const forwardInSeconds = (seconds: number, fromDate?: Date): Date => {
	return dayjs(fromDate).add(seconds, "seconds").toDate();
};
