import { StatusCodes } from "http-status-codes";
import { handleBadRequest, handleUnauthorized } from "../utils/error.utils.js";
import security from "../utils/security.utils.js";

const refreshTokens = async (req, res) => {
    if (req.cookies && req.cookies[security.refreshTokenCookieKey]) {
        let token = req.cookies.get(security.refreshTokenCookieKey);
        let id = await security.isRefreshable(token);
        if (id) {
            let authentication = security.refresh(token, id);
            security.sendAuthorized(res, authentication);
            return;
        }
    }
    handleBadRequest(res, "Malformed refresh request");
};

const logout = async (req, res) => {
    let preAuthorized = security.parseTokenFromRequest(req);
    if (preAuthorized && preAuthorized.sub) {
        security.logout(sub);
    }

    return res.status(StatusCodes.OK).send();
};

/**
 * Http Handler for login procedure
 * 1. first it checks headers for an 'Authorization' jwt and if it is valid sends OK and returns
 * 2. then it checks refresh cookies. If it can refresh it does and generates a new token pair sends OK with body and cookie and returns
 * 3. otherwise proceeds to creds login
 * @param {*} req
 * @param {*} res
 * @returns
 */
const login = async (req, res) => {
    // STEP 1.
    let preAuthorized = security.parseTokenFromRequest(req);
    if (preAuthorized) {
        res.status(StatusCodes.OK).send();
        return;
    }
    // STEP 2.
    let id = false;
    let token = undefined;
    if (req.cookies && req.cookies[security.refreshTokenCookieKey]) {
        token = req.cookies[security.refreshTokenCookieKey];
        id = await security.isRefreshable(token);
    }
    if (id) {
        let authentication = security.refresh(token, id);
        security.sendAuthorized(res, authentication);
        return;
    }

    // STEP 3.
    if (
        req.body &&
        (req.body.username || req.body.email) &&
        req.body.password
    ) {
        let { username, email, password } = req.body;
        let authentication = false;
        if (username) {
            authentication = await security.authenticate({
                username,
                password,
            });
        } else {
            authentication = await security.authenticate({ email, password });
        }

        if (authentication.accessToken) {
            security.sendAuthorized(res, authentication);
            return;
        } else {
            handleUnauthorized(res, "Incorrect credentials");
            return;
        }
    }

    handleBadRequest(
        res,
        "Login body must contain password and either username or email"
    );
};

const auth = async (req, res) => {
    if (security.parseTokenFromRequest(req)) {
        res.status(StatusCodes.OK).send();
    } else {
        res.status(StatusCodes.UNAUTHORIZED).send();
    }
};

export default { auth, login, logout, refreshTokens };
