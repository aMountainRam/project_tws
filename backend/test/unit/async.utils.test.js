import { expect } from "chai";
import sinon from "sinon";
import { wrap } from "../../src/utils/async.utils.js";

describe("", () => {
    let test = sinon.stub();
    afterEach("check call params", () => {
        expect(test.getCall(0).args[0]).to.be.equal("first");
        expect(test.getCall(0).args[1]).to.be.equal("second");
    });
    it("fulfills the promise", async () => {
        test.callsFake(function(str, _, cb) {
            cb(null, str);
        });
        expect(await wrap(test, "first", "second")).to.be.equal("first");
    });
    it("throws externally when func callback has error and rejects", async () => {
        test.callsFake(function(_1, _2, cb) {
            cb(new Error("error"), null);
        });
        await wrap(test, "first", "second").catch((err) =>
            expect(err.message).to.be.equal("Error: error")
        );
    });
    it("throws internally when func throws and rejects", async () => {
        test.callsFake(function() {
            throw new Error("error");
        });
        await wrap(test, "first", "second").catch((err) =>
            expect(err.message).to.be.equal("error")
        );
    });
});
