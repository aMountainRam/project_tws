import { logShutdown } from "./service/logs.service.js";
import { dbShutdown } from "./service/mongodb.service.js";
import { sessionShutdown } from "./service/session.service.js";
import "./service/https.service.js";

const shutdown = async (signal) => {
    signal && console.log(`Received ${signal}`);
    logShutdown(() => console.log("Shutting down logs..."));
    dbShutdown(() => console.log("Shutting down db connections..."));
    sessionShutdown(() => console.log("Shutting down session connections..."))
    process.exit(0);
};

process.on("SIGINT", shutdown);
