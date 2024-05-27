import { type Job, MetricsTime, Queue, Worker } from "bullmq";
import {
	BULL_QUEUE,
	BULL_QUEUE_JOB_REMOVAL,
	EMAIL_TYPE,
	type IEmailActiveAccount,
	type IEmailWelcome,
} from "src/common";
import { config } from "src/config/env";
import { queueLogger } from "src/config/logger";
import { emailService } from "src/service";

export const sendEmailQueue = new Queue(BULL_QUEUE.SEND_MAIL, {
	connection: {
		host: config.redisHost,
		port: config.redisPort,
		password: config.redisPassword,
	},
});

export const sendEmailWorker = new Worker(
	BULL_QUEUE.SEND_MAIL,
	async (job: Job<IEmailActiveAccount | IEmailWelcome>) => {
		queueLogger.info(
			`Send email job with jobId: ${job.id}, job data ${JSON.stringify(
				job.data,
			)}`,
		);
		const { emailType } = job.data;
		switch (emailType) {
			case EMAIL_TYPE.VERIFY_ACCOUNT:
				await emailService.sendEmail(job.data, "Verify your account");
				break;

			case EMAIL_TYPE.WELCOME:
				await emailService.sendEmail(job.data, "Welcome");
				break;
		}
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
