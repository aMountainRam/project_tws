import mongoose from "mongoose";
import security from "../utils/security.utils.js";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            lowercase: true,
            required: [true, "cannot be empty"],
            match: [
                /^[a-zA-Z0-9]+$/,
                "must contain only alphanumeric characters",
            ],
            unique: true,
        },
        email: {
            type: String,
            lowercase: true,
            required: [true, "cannot be empty"],
            match: [/\S+@\S+\.\S+/, "is invalid"],
            unique: true,
            set: (value) => value.toLowerCase(),
        },
        bio: String,
        image: String,
        password: {
            type: String,
            set: setPassword,
        },
        enabled: {
            type: Boolean,
            default: true,
        },
        expired: {
            type: Boolean,
            default: false,
        },
        locked: {
            type: Boolean,
            default: false,
        },
        credentialsExpired: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

function setPassword(plaintext) {
    return security.hashSync(plaintext);
}
userSchema.methods.isValidPassword = function (plaintext) {
    return security.compare(plaintext, this.password);
};

mongoose.model("User", userSchema);
