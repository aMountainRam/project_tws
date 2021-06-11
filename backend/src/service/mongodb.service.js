import mongoose from "mongoose";
import logger from "log4js";
import sslContext from "../config/ssl.config.js";

import "../model/user.model.js";

const {DBHOST, DBPORT, DBNAME} = process.env;
const context = {
    host: DBHOST,
    port: DBPORT,
    name: DBNAME,
    options: {
        poolSize: 10,
        authMechanism: "MONGODB-X509",
        ssl: true,
        sslCA: sslContext.ca,
        sslKey: sslContext.key,
        sslCert: sslContext.cert,
        sslPass: sslContext.passphrase,
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true,
    },
};
mongoose.Promise = global.Promise;
mongoose.set("debug", (coll, method, query) =>
    logger
        .getLogger("events")
        .debug(
            `called '${method}' on collection '${coll}': ${JSON.stringify(
                query
            )}`
        )
);

const dbLogger = logger.getLogger("database");
mongoose.connection
    .once("open", () =>
        dbLogger.info(
            `Connected to mongodb://${context.host}:${context.port}/${context.name}`
        )
    )
    .on("error", (error) =>
        logger.getLogger("default").warn("Error : ", error)
    );

mongoose.connect(
    `mongodb://${context.host}:${context.port}/${context.name}`,
    context.options,
    (err) => err && dbLogger.error(err)
);

export const dbShutdown = function (cb) {
    mongoose.disconnect().then(() => cb);
};
