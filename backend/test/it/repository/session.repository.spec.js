import sessionRepository from "../../../src/repository/session.repository.js";
import { v4 as uuid } from "uuid";
import { expect } from "chai";

describe("redis operation atomicity", () => {
    before("setup connect to db 15", () =>
        sessionRepository.client.select(process.env.SESSIONTESTNUM)
    );
    beforeEach("flush db 15", async () => {
        sessionRepository.client.flushall(async () =>
            expect(await sessionRepository.asyncKeys("*")).to.have.lengthOf(0)
        );
    });
    after("get back to zero", () => {
        sessionRepository.client.select(0);
    });
    it("should write, then read and delete atomically", () => {
        let token = uuid();
        let id = uuid();
        sessionRepository.setRefreshToken(token, id, () => {
            sessionRepository.getAndDelete(token, (_1, v1) => {
                expect(v1).to.be.equal(id);
                sessionRepository.getAndDelete(token, (_2, v2) => {
                    expect(v2).to.be.null;
                });
            });
        });
    });
});
