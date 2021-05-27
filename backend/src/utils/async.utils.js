import logger from "log4js";

const logError = (type, err) => type && logger.getLogger(type).error(err);

const apply = (func, resolve, ...args) =>
    func(...args, (err, val) => {
        if (err) {
            throw new Error(err);
        } else {
            resolve(val);
        }
    });

async function wrapAndLog(type, func, ...args) {
    return new Promise((resolve, reject) => {
        try {
            apply(func, resolve, ...args);
        } catch (err) {
            logError(type, err);
            reject(err);
        }
    });
}

async function alwaysAndLog(type, func, ...args) {
    return new Promise((resolve, _) => {
        try {
            apply(func, resolve, ...args);
        } catch (err) {
            logError(type, err);
            resolve(null);
        }
    });
}

async function wrap(func, ...args) {
    return wrapAndLog(undefined, func, ...args);
}

async function always(func, ...args) {
    return alwaysAndLog(undefined, func, ...args);
}

export { wrap, wrapAndLog, always, alwaysAndLog };
