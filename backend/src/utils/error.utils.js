import { StatusCodes } from "http-status-codes";

export const dbError = {
    "E11000": "duplicate key"
}

const badRequest = (msg) => {
    return { message: `Bad request caused by: ${msg}.` };
};
const internalServerError = () => {
    return { message: "Oops! An error occured." };
};
export const handleBadRequest = (res,msg) => {
    res.status(StatusCodes.BAD_REQUEST).send(badRequest(msg));
}
export const handleUnauthorized = (res,msg) => {
    res.status(StatusCodes.UNAUTHORIZED).send({message: msg})
}