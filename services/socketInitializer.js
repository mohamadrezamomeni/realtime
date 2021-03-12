const redisAdapter = require("socket.io-redis");

module.exports = (io) => {
    io.adapter(redisAdapter({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    }));
};