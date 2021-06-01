import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";
import { StatusCodes } from "http-status-codes";
import { v4 as uuid } from "uuid";
import sslContext from "../config/ssl.config.js";
import userRepository from "../repository/user.repository.js";
import sessionRepository from "../repository/session.repository.js";

const saltRounds = 10;
const refreshTokenCookieKey = "__Secure-servicetws-refresh-token";
const cookieOpts = {
    domain: "servicetws.com",
    secure: true,
    httpOnly: true,
    sameSite: process.env.COOKIE_SAMESITE,
    path: `${process.env.API_CONTEXT}/auth/token`,
    maxAge: sessionRepository.refreshDefaultExpiration * 1_000,
};
const jwtOpts = {
    algorithm: "RS256",
    expiresIn: 300,
    issuer: sslContext._get("altnames")[0],
};

const parseTokenFromRequest = (req) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.match(/^Bearer .(.*)$/)
    ) {
        let accessToken = req.get("authorization").split(" ")[1];
        return isValid(accessToken);
    }
    return false;
};

/**
 * Refactors bcrypt hashSync to fix a salt length
 * @param {Number} plaintext
 * @returns
 */
const hashSync = (plaintext) => {
    return bcrypt.hashSync(plaintext, saltRounds);
};

/**
 * Refactors bcrypt compare to fix a salt length
 * @param {*} plaintext
 * @param {*} encrypted
 * @param {*} cb
 * @returns
 */
const compare = (plaintext, encrypted, cb) => {
    if (cb) {
        return bcrypt.compare(plaintext, encrypted, cb);
    } else {
        return bcrypt.compare(plaintext, encrypted);
    }
};

/**
 * Generates a pair access/refresh tokens for a given
 * subject (i.e., user id)
 * @param {String} subject
 * @returns
 */
const generateTokens = (subject) => {
    const payload = {
        sub: subject,
        jtd: uuid(),
    };
    return {
        accessToken: jwt.sign(payload, sslContext, jwtOpts),
        refreshToken: uuid(),
        tokenType: "Bearer",
        expiresIn: jwtOpts.expiresIn,
    };
};

/**
 * Checks whether an access token is
 * valid or not
 * @param {String} token
 * @returns
 */
const isValid = (token) => {
    try {
        return jwt.verify(token, sslContext.cert);
    } catch (err) {
        return false;
    }
};

/**
 * Checks whether a provided refresh token is
 * suitable for refresh
 * @param {*} token
 * @returns
 */
const isRefreshable = async (token) => {
    let id = await sessionRepository.asyncGet(token);
    let isLoggedOut = await sessionRepository
        .asyncHgetall(id)
        .catch((err) => console.log(err));
    if (isLoggedOut) {
        return false;
    } else {
        return id;
    }
};

/**
 * Async send to session the refresh token
 * then fills up the http response with OK status,
 * the refresh token cookie and the access token
 * @param {*} res
 * @param {*} param1
 */
const sendAuthorized = (res, { refreshToken, ...rest }) => {
    res.status(StatusCodes.OK);
    res.cookie(refreshTokenCookieKey, refreshToken, cookieOpts);
    res.send({ ...rest, refreshToken });
};

/**
 * Returns a generate pair of tokens if either username/password
 * or email/password is valid. It implements the correct check according
 * to which in not undefined amongst username and email. In case both are
 * initialized it goes for username
 * @param {*} param0
 * @returns
 */
const authenticate = async ({ username, email, password }) => {
    let userPromise = undefined;
    if (username) {
        userPromise = userRepository.findUserByUsername(username);
    } else if (email) {
        userPromise = userRepository.findUserByEmail(email);
    } else {
        return {};
    }

    try {
        let user = await userPromise;
        let authentication = (await user.isValidPassword(password))
            ? generateTokens(user._id.toString())
            : {};
        if (authentication.refreshToken) {
            // removes any logout token
            sessionRepository.client.del(user._id.toString());
            // sets new refresh token
            sessionRepository.setRefreshToken(
                authentication.refreshToken,
                user._id.toString()
            );
        }
        return authentication;
    } catch (_) {
        return {};
    }
};

/**
 * In-place replace of refresh token
 * @param {*} newToken
 * @param {*} newId
 * @param {*} oldToken
 */
const replaceRefreshToken = (newToken, newId, oldToken) => {
    if (oldToken) sessionRepository.setAndDelete(newToken, newId, oldToken);
    else sessionRepository.setRefreshToken(newToken, newId);
};

/**
 * Refreshes a refreshToken
 * @param {*} token
 */
const refresh = (token, sub) => {
    const tokens = generateTokens(sub);
    replaceRefreshToken(tokens.refreshToken, sub, token);
    return tokens;
};

/**
 * Invalidates all refresh tokens for a given sub id
 * @param {*} sub
 */
const logout = (sub) => {
    sessionRepository.client.hmset(
        sub,
        "type",
        "logout",
        "date",
        moment.utc().toISOString()
    );
};

export default {
    hashSync,
    compare,
    parseTokenFromRequest,
    generateTokens,
    refreshTokenCookieKey,
    cookieOpts,
    isValid,
    sendAuthorized,
    isRefreshable,
    replaceRefreshToken,
    authenticate,
    logout,
    refresh,
};
