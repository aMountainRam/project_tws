import { promisify } from "util";
import "../../src/server.js";
import session from "../../src/service/session.service.js";
import mongoose from "mongoose";
import logger from "log4js";
import { assert, expect } from "chai";

logger.getLogger("events").level = "off";
logger.getLogger("database").level = "off";

// CHECK REDIS SESSION MANAGEMENT CONNECTIVITY

const client = session.client;
const asyncKeys = promisify(client.keys).bind(client);
describe("test session management connection", () => {
    before("setup connect to db 15", () =>
        client.select(process.env.SESSIONTESTNUM)
    );
    beforeEach("flush db 15", () => {
        client.flushall(async () =>
            expect(await asyncKeys("*")).to.have.lengthOf(0)
        );
    });
    after("get back to zero", () => {
        session.client.select(0);
    });
    it("should write and read from redis", () => {
        session.client.set("key", "value");
        assert(
            session.client.get("key", function (_, v) {
                expect(v).to.be.equal("value");
            })
        );
    });
});

// CHECK MONGODB DATABASE CONNECTIVITY

describe("check mongodb connection", () => {
    it("should return the client", () => {
        assert(mongoose.connection.getClient().isConnected());
    });
});
