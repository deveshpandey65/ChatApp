const { createClient } = require('redis');
require("dotenv").config();
let redisClient;

async function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient({
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST ,
                port: process.env.REDIS_PORT,
            },
        });

        redisClient.on('error', (err) => console.error('Redis Client Error', err));

        await redisClient.connect();
    }
    return redisClient;
}

module.exports = getRedisClient;





















// const Redis = require('ioredis');

// // const redisHost = process.env.REDIS_HOST || 'redis';
// // const redisPort = process.env.REDIS_PORT || 6379;
// const redisHost = 'redis';
// const redisPort =  6379;

// const client = new Redis({
//     host: redisHost,
//     port: redisPort
// });

// client.on('error', (err) => {
//     console.error('Redis error:', err);
// });

// module.exports = client;