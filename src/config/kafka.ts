import { Kafka, Partitioners, type Producer } from "kafkajs";
import { env } from "src/config/env";

export const kafkaClient: Kafka = new Kafka({
	clientId: env.kafkaClientId,
	brokers: env.kafkaBrokers,
});

export const producer: Producer = kafkaClient.producer({
	createPartitioner: Partitioners.DefaultPartitioner,
});
