var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.KafkaClient({kafkaHost: process.env.KAFKA_HOST}),
    producer = new Producer(client);


module.exports = {
    sendOneByKey: (topic, key, message) => {
        return new Promise((resolve, reject) => {
            if (!producer.ready) reject("producer isn't ready");
            var km = new KeyedMessage(key, message),
                payload = [
                    {topic: topic, messages: km}
                ];
            producer.send(payload, (err, reply) => {
                if (err) reject(err);
                if (reply) resolve(reply);
            });
        });
    }
};