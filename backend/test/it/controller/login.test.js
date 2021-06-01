import security from "../../../src/utils/security.utils.js";
import authController from "../../../src/controller/auth.controller.js";
import { User } from "../../../src/model/user.model.js";
import httpMocks from "node-mocks-http";
import chai, { assert, expect } from "chai";
import chaiUUID from "chai-uuid";
import { StatusCodes } from "http-status-codes";
import sessionRepository from "../../../src/repository/session.repository.js";
chai.use(chaiUUID);

describe("attempt login", () => {
    let req = undefined;
    let res = undefined;
    let user = {
        username: "username",
        email: "email@mail.com",
        password: "password",
    };
    let dbUser = undefined;
    before("setup connect to db 15", () =>
        sessionRepository.client.select(process.env.SESSIONTESTNUM)
    );
    beforeEach("setup", async () => {
        sessionRepository.client.flushall(async () =>
            expect(await sessionRepository.asyncKeys("*")).to.have.lengthOf(0)
        );
        res = httpMocks.createResponse();
        await User.deleteMany({}).exec();
        dbUser = await User.create(user);
    });
    after("get back to zero", () => {
        sessionRepository.client.select(0);
    });
    it("should perform a login with body 'usename' + 'password'", async () => {
        req = httpMocks.createRequest({
            body: { username: user.username, password: user.password },
        });
        await authController.login(req, res);
        expect(res.statusCode).to.be.equal(StatusCodes.OK);
        expect(res.cookies).to.not.be.empty;

        let cookie = res.cookies[security.refreshTokenCookieKey];
        expect(cookie.value).to.be.a.uuid("v4");
        let options = cookie.options;
        expect(options).to.have.property("httpOnly", true);
        expect(options).to.have.property("secure", true);

        expect(res._getData()).to.have.property("accessToken");
        let { accessToken } = res._getData();

        sessionRepository.client.get(cookie.value, (_, v) =>
            expect(v).to.equal(dbUser._id.toString())
        );
        assert(security.isValid(accessToken));
    });
    it("should get bad request on missing body properties", async () => {
        req = httpMocks.createRequest({
            body: { username: "asd" },
        });
        await authController.login(req, res);
        expect(res.statusCode).to.be.equal(StatusCodes.BAD_REQUEST);
    });
    it("should get unauthorized (401) on wrong password", async () => {
        req = httpMocks.createRequest({
            body: { username: "username", password: "asd" },
        });
        await authController.login(req, res);
        expect(res.statusCode).to.be.equal(StatusCodes.UNAUTHORIZED);
    });

    it("should login and authenticate", async () => {
        req = httpMocks.createRequest({
            body: { username: "username", password: "password" },
        });
        await authController.login(req, res);
        let { accessToken, tokenType } = res._getData();
        req = httpMocks.createRequest({
            headers: { authorization: `${tokenType} ${accessToken}` },
        });
        let res2 = httpMocks.createResponse();
        await authController.auth(req, res2);
        expect(res2.statusCode).to.be.equal(StatusCodes.OK);
    });
    it("should login and attempt refresh", async () => {
        // login in
        req = httpMocks.createRequest({
            body: { username: "username", password: "password" },
        });
        await authController.login(req, res);

        // request a refresh using the cookie
        let cookie = res.cookies[security.refreshTokenCookieKey];
        req = httpMocks.createRequest({
            cookies: {
                [security.refreshTokenCookieKey]: cookie.value,
            },
        });
        let res2 = httpMocks.createResponse();
        await authController.refreshTokens(req, res2);
        expect(res2.statusCode).to.be.equal(StatusCodes.OK);
        expect(res2._getData()).to.have.property("accessToken");

        expect(res2.cookies[security.refreshTokenCookieKey]).to.not.be.equal(
            cookie
        );

        // get authentication
        let { accessToken, tokenType } = res2._getData();
        req = httpMocks.createRequest({
            headers: {
                authorization: `${tokenType} ${accessToken}`,
            },
        });
        let res3 = httpMocks.createResponse();
        await authController.auth(req, res3);
        expect(res3.statusCode).to.be.equal(StatusCodes.OK);
    });
});
