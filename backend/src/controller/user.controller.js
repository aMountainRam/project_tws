import { StatusCodes } from "http-status-codes";
import { handleBadRequest } from "../utils/error.utils.js";
import mongoose from "mongoose";

const User = mongoose.connection.models["User"];

const createUser = async (req, res) => {
    if (req.body) {
        return User.create(req.body)
            .then((user) => {
                res.status(StatusCodes.OK).send();
                return user;
            }).catch((err) =>
                res.status(StatusCodes.BAD_REQUEST).send(err));
    } else {
        handleBadRequest(res,"username cannot be blank");
        return Promise.reject();
    }
};

export default { createUser };
