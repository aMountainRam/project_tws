import redis from "redis";
import logger from "log4js";
import sslContext from "../config/ssl.config.js";
import asyncRedis from "async-redis";

const env = process.env;
const log = logger.getLogger("session");

const context = {
    tls: {
        host: env.SESSIONHOST,
        port: env.SESSIONPORT,
        rejectUnauthorized: false,
        ...sslContext,
        callback: () => console.log("hey"),
    },
};

const client = redis.createClient(context);
const asyncClient = asyncRedis.decorate(client);

client.on("error", (err) => log.error(err));
client.once("connect", () =>
    log.info(`Connected to session manager on port: ${context.tls.port}`)
);

export const sessionShutdown = (cb) => client.quit(cb);
export default { client, asyncClient };
