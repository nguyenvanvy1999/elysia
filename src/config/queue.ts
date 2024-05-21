import { type Job, MetricsTime, Queue, Worker } from "bullmq";
import {
	BULL_QUEUE,
	BULL_QUEUE_JOB_REMOVAL,
	type ISendActiveAccountEmailJob,
} from "src/common";
import { config } from "src/config/env";
import { queueLogger } from "src/config/logger";
import { sendEmailActiveAccount } from "src/service";

export const sendEmailQueue = new Queue(BULL_QUEUE.SEND_MAIL, {
	connection: {
		host: config.redisHost,
		port: config.redisPort,
		password: config.redisPassword,
	},
});

export const sendEmailWorker = new Worker(
	BULL_QUEUE.SEND_MAIL,
	async (job: Job<ISendActiveAccountEmailJob>) => {
		queueLogger.info(
			`Send email job with jobId: ${job.id}, job data ${JSON.stringify(
				job.data,
			)}`,
		);
		await sendEmailActiveAccount(job.data.url, job.data.email);
	},
	{
		connection: {
			host: config.redisHost,
			port: config.redisPort,
			password: config.redisPassword,
		},
		removeOnComplete: { count: BULL_QUEUE_JOB_REMOVAL.SEND_MAIL.MAX_COMPLETED },
		removeOnFail: { count: BULL_QUEUE_JOB_REMOVAL.SEND_MAIL.MAX_COMPLETED },
		metrics: {
			maxDataPoints: MetricsTime.ONE_WEEK * 2,
		},
	},
);
