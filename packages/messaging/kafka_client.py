from confluent_kafka import Producer, Consumer
import json
import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class KafkaProducerClient:
    def __init__(self, brokers: str = "localhost:9092"):
        self.producer = Producer({
            'bootstrap.servers': brokers,
            'client.id': 'fios-producer',
            'linger.ms': 10,
            'batch.num.messages': 1000
        })

    def delivery_report(self, err, msg):
        if err is not None:
            logger.error(f"Message delivery failed: {err}")
        else:
            logger.debug(f"Message delivered to {msg.topic()} [{msg.partition()}]")

    def publish_event(self, topic: str, event: BaseModel):
        try:
            self.producer.produce(
                topic,
                value=event.model_dump_json().encode('utf-8'),
                callback=self.delivery_report
            )
            self.producer.poll(0)
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")

    def flush(self):
        self.producer.flush()

class KafkaConsumerClient:
    def __init__(self, group_id: str, topics: list[str], brokers: str = "localhost:9092"):
        self.consumer = Consumer({
            'bootstrap.servers': brokers,
            'group.id': group_id,
            'auto.offset.reset': 'earliest'
        })
        self.consumer.subscribe(topics)

    def consume(self, timeout: float = 1.0):
        msg = self.consumer.poll(timeout)
        if msg is None:
            return None
        if msg.error():
            logger.error(f"Consumer error: {msg.error()}")
            return None
        return json.loads(msg.value().decode('utf-8'))

    def close(self):
        self.consumer.close()
