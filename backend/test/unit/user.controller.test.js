import sinon from "sinon";
import httpMocks from "node-mocks-http";
import userController from "../../src/controller/user.controller.js";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
chai.use(chaiAsPromised);

const User = mongoose.connection.models["User"];

describe("test con user creation", () => {
    beforeEach("setup", () => {
        sinon.createSandbox();
    });
    afterEach("cleanup", () => {
        sinon.restore();
    });
    it("create a user with/without body", async () => {
        let req = {};
        let res = httpMocks.createResponse();
        userController.createUser(req, res);
        expect(res.statusCode).to.be.equal(StatusCodes.BAD_REQUEST);
        expect(res._getData()).to.have.property("message");

        let create = sinon.stub(User, "create").resolves();
        req = { body: {} };
        res = httpMocks.createResponse();
        expect(userController.createUser(req, res)).to.eventually.fulfilled;
        expect(res.statusCode).to.be.equal(StatusCodes.OK);
        sinon.assert.calledOnce(create);
    });
    it("should throw/catch on bad request when user create fails",async ()=> {
        let req = {body:{}};
        let res = httpMocks.createResponse();
        let create = sinon.stub(User, "create").returns(Promise.reject(new Error()));
        expect(await userController.createUser(req, res)).to.throw;
        sinon.assert.calledOnce(create);
        assert(res._getData() instanceof Error);
    });
});
