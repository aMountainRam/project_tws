import https from "https";
import logger from "log4js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import sslContext from "../config/ssl.config.js";
import router from "../router/app.router.js";

const app = express();

/**
 * SECURITY
 */
const corsOptions = {
    origin: [
        /^(https?:\/\/(?:.+\.)?localhost(?::\d{1,5})?)$/,
        /^(https?:\/\/(?:.+\.)?servicetws\.com(?::\d{1,5})?)$/,
    ],
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

/**
 * REQ/RES PARSING
 */
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser())

/**
 * ROUTER
 */
app.use("/api",router);

const PORT = process.env.NODE_PORT || 8443;
const log = logger.getLogger("events");
const server = https
    .createServer(sslContext, app)
    .listen(PORT, () => log.info(`Running on port ${PORT}`))
    .addListener("error", (err) => log.warn(err));

export const serverShutdown = server.close;
