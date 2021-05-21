import bcrypt from "bcrypt";

const saltRounds = 10;
const hashSync = (plaintext) => {
    return bcrypt.hashSync(plaintext, saltRounds);
};
const compare = (plaintext, encrypted, cb = undefined) => {
    if (cb) {
        return bcrypt.compare(plaintext, encrypted, cb);
    } else {
        return bcrypt.compare(plaintext, encrypted);
    }
};

export default { hashSync, compare };
