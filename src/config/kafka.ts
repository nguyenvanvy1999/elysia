import chalk from "chalk";
import { Kafka, Partitioners, type Producer } from "kafkajs";
import { config } from "src/config/env";
import { kafkaLogger } from "src/config/logger";

export const kafkaClient: Kafka = new Kafka({
	clientId: config.kafkaClientId,
	brokers: config.kafkaBrokers,
});

export const producer: Producer = kafkaClient.producer({
	createPartitioner: Partitioners.DefaultPartitioner,
});

export const connectKafka = async (): Promise<void> => {
	try {
		await producer.connect();
		kafkaLogger.info(chalk.green("✅  Connect kafka success"));
	} catch (e) {
		kafkaLogger.error(`❌  Connect kafka failed: ${JSON.stringify(e)}`);
	}
};
