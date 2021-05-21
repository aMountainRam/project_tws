import { expect } from "chai";
import { randomString } from "../../src/utils/string.utils.js";

describe("test random string generator", () => {
    it("should return a different string each time it is called", () => {
        let current = randomString(16);
        let index = 0;
        do {
            let newString = randomString(16);
            expect(newString).to.be.a("string");
            expect(current).to.not.be.equal(newString);
            current = newString;
            index++;
        } while (index < 100);
    });
    it("should return an alphanumeric string", () => {
        for (let i = 0; i < 100; i++) {
            expect(randomString(16)).to.match(/^[a-zA-Z0-9]+$/);
        }
    });
});
