import sinon from "sinon";
import { assert, expect } from "chai";
import security from "../../src/utils/security.utils.js";
import { User } from "../../src/model/user.model.js";
import userRepository from "../../src/repository/user.repository.js";
import sessionRepository from "../../src/repository/session.repository.js";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

describe("qwe", () => {
    before("setup connect to db 15", () =>
        sessionRepository.client.select(process.env.SESSIONTESTNUM)
    );
    beforeEach("flush db 15", async () =>
        sessionRepository.client.flushall(async () =>
            expect(await sessionRepository.asyncKeys("*")).to.have.lengthOf(0)
        )
    );
    after("get back to zero", () => sessionRepository.client.select(0));
    describe("tests on tokens", () => {
        it("should return a token pair for a given subject", () => {
            let tokens = security.generateTokens("username");
            expect(tokens).to.have.property("accessToken");
            expect(tokens).to.have.property("refreshToken");
        });
        it("should not generate the same pair twice even for the same subject", () => {
            let arr = Array(10)
                .fill(0)
                .map(() => security.generateTokens("username"));

            let arrAccess = [];
            let arrRefresh = [];
            arr.forEach(
                function (e) {
                    this.arrAccess.push(e.accessToken);
                    this.arrRefresh.push(e.refreshToken);
                },
                { arrAccess, arrRefresh }
            );
            assert(arrAccess.length === new Set(arrAccess).size);
            assert(arrRefresh.length === new Set(arrRefresh).size);
        });
        it("once decrypted we can confirm the subject", () => {
            let { accessToken } = security.generateTokens("username");
            let creds = security.isValid(accessToken);
            assert(creds);
            expect(creds.sub).to.be.equal("username");
        });
        it("should return false on invalid access token", () => {
            assert(!security.isValid("whatever"));
        });
    });
    describe("test authentication", () => {
        let findUsername = undefined;
        let findEmail = undefined;
        let user = new User({
            username: "username",
            email: "email@mail.com",
            password: "password",
        });
        before("should make a user available", () => {
            sinon.createSandbox();
            findUsername = sinon.stub(userRepository, "findUserByUsername");
            findEmail = sinon.stub(userRepository, "findUserByEmail");
            sinon.stub(sessionRepository, "setRefreshToken").returns(true);
        });
        after("cleanup", () => {
            sinon.restore();
        });
        it("should find a user and if credentials are correct", async () => {
            findUsername.resolves(user);
            let auth = {};
            auth = await security.authenticate({
                username: "username",
                password: "password",
            });
            expect(auth).to.have.property("accessToken");
            expect(security.isValid(auth.accessToken)).to.have.property(
                "sub",
                user._id.toString()
            );
            findEmail.resolves(user);
            auth = await security.authenticate({
                email: "email@mail.com",
                password: "password",
            });
            expect(auth).to.have.property("accessToken");
            expect(security.isValid(auth.accessToken)).to.have.property(
                "sub",
                user._id.toString()
            );
        });
        it("should not authenticate on wrong password", async () => {
            findUsername.resolves(user);
            expect(
                await security.authenticate({
                    username: "username",
                    password: "passwor",
                })
            ).to.be.empty;
            findEmail.resolves(user);
            expect(
                await security.authenticate({
                    email: "email@mail.com",
                    password: "passwor",
                })
            ).to.be.empty;
        });
        it("should not authenticate on missing user", async () => {
            findUsername.rejects();
            expect(
                await security.authenticate({
                    username: "usernam",
                    password: "password",
                })
            ).to.be.empty;
            findEmail.rejects();
            expect(
                await security.authenticate({
                    email: "mail@mail.com",
                    password: "password",
                })
            ).to.be.empty;
        });
        it("should check refreshable token", async () => {
            let id = mongoose.Types.ObjectId().toString();
            let token = uuid();
            await sessionRepository.asyncSetex(token, sessionRepository.refreshDefaultExpiration, id);
            let val = await security.isRefreshable(token);
            expect(val).to.be.equal(id);
        });
        it("should logout", async () => {
            let id = mongoose.Types.ObjectId().toString();
            let token = uuid();
            await sessionRepository
                .asyncSetex(token, sessionRepository.refreshDefaultExpiration, id)
                .then(() => security.logout(id));
            let val = await security.isRefreshable(token);
            assert(!val);
        });
    });
});
