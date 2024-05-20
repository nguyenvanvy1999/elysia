import { Queue, Worker } from "bullmq";
import { BULL_QUEUE } from "src/common";
import { config } from "src/config/env";

export const sendEmailQueue = new Queue(BULL_QUEUE.SEND_MAIL, {
	connection: {
		host: config.redisHost,
		port: config.redisPort,
		password: config.redisPassword,
	},
});

export const sendEmailWorker = new Worker(
	BULL_QUEUE.SEND_MAIL,
	async (job) => {},
	{
		connection: {
			host: config.redisHost,
			port: config.redisPort,
			password: config.redisPassword,
		},
	},
);
