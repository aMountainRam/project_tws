import { User } from "../model/user.model.js";
import logger from "log4js";

const log = logger.getLogger("database");

const findUserByUsername = async (username) => {
    return User.findOne({ username })
        .exec()
        .catch((err) => {
            log.error(err);
            return undefined;
        });
};
const findUserByEmail = async (email) => {
    return User.findOne({ email })
        .exec()
        .catch((err) => {
            log.error(err);
            throw new Error(err);
        });
};

export default { findUserByUsername, findUserByEmail };
