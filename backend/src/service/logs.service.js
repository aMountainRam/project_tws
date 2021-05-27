import logger from "log4js";

logger.configure({
    appenders: { console: { type: "console" } },
    categories: {
        database: {
            appenders: ["console"],
            level: "info"
        },
        session: {
            appenders: ["console"],
            level: "info"
        },
        default: {
            appenders: ["console"],
            level: "info",
        },
        events: {
            appenders: ["console"],
            level: "debug"
        }
    },
});

export const logShutdown = logger.shutdown;
