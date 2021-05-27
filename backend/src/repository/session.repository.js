import session from "../service/session.service.js";
const client = session.client;

const asyncClient = {};
const capitalize = (str) =>
    str.substring(0, 1).toUpperCase() + str.substring(1);
for (const [key, value] of Object.entries(session.asyncClient)) {
    if (key.substring(0, 1).match(/[a-z]/))
        asyncClient[`async${capitalize(key)}`] = value;
}

const refreshDefaultExpiration = 604_800; // 7d * 24h * 60m * 60s

const setRefreshToken = (token, id, cb) =>
    client.setex(token, refreshDefaultExpiration, id, cb);
const getAndDelete = (token, cb) =>
    client.multi().get(token, cb).del(token).exec_atomic();
const setAndDelete = (
    newToken,
    newId,
    oldToken,
    ex = refreshDefaultExpiration
) => client.multi().setex(newToken, ex, newId).del(oldToken).exec_atomic();

export default {
    refreshDefaultExpiration,
    getAndDelete,
    setAndDelete,
    setRefreshToken,
    client,
    ...asyncClient,
};
