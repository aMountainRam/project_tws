import { expect } from "chai";
import sslContext from "../../src/config/ssl.config.js";

describe("check this in _getSubject can reach the service crt", () => {
    it("",() => {
        expect(sslContext._get("subject")).to.be.a("string");
        expect(sslContext._get("altnames")).to.have.length.greaterThanOrEqual(1);
    })
})