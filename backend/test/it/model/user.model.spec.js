import { assert, expect } from "chai";
import mongoose from "mongoose";
import { dbError } from "../../../src/utils/error.utils.js";
import { randomString } from "../../../src/utils/string.utils.js";
const User = mongoose.connection.models["User"];

describe("CRUD operations on user model", () => {
    beforeEach("users collection cleanup", async () => {
        await User.deleteMany({}).exec();
    });
    describe("create some users and confirm they were persisted", () => {
        let n = 10;
        it(`create ${n} users`, async () => {
            let users = Array(10)
                .fill(0)
                .map(() => {
                    return new User({
                        username: randomString(16),
                        email: `${randomString(9)}@mail.com`,
                        hash: "banana",
                    });
                });
            await User.insertMany(users);
            expect(await User.countDocuments({}).exec()).to.be.equal(n);
        });
        it("sets the hashed password", async () => {
            const password = "password";
            let user = new User({
                username: randomString(16),
                email: `${randomString(9)}@mail.com`,
                hash: password,
            });
            expect(user.get("hash", String)).to.not.be.undefined;
            expect(user.get("hash", String)).to.not.be.equal(password);
            assert(await user.isValidPassword(password));
        });
        it("should throw when saving two users with the same username (and save one of them)", async () => {
            await User.insertMany([
                {
                    username: "u1",
                    email: "email@mail.com",
                    password: "password",
                },
                {
                    username: "u1",
                    email: "anotheremail@mail.com",
                    password: "password",
                },
            ]).catch(err => expect(err.message).to.contain(dbError["E11000"]));
            expect(await User.countDocuments({}).exec()).to.be.equal(1)
        });
    });
});
