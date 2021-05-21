import "../../src/server.js";
import logger from "log4js";

logger.getLogger("events").level = "off";
logger.getLogger("database").level = "off";
