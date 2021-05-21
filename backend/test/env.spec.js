import fs from "fs";
import dotenv from "dotenv";
import { expect } from "chai";

describe("test environment variables where properly uploaded", () => {
    let env = {};
    before(() => {
        env = dotenv.parse(fs.readFileSync("config/.env.test"));
    });
    it("should compare '.env.test' file with the loaded environmental variables", () => {
        const keys = Object.keys(env);
        expect(
            keys,
            "if fails '.env.test' is not necessary"
        ).to.not.have.lengthOf(0);
        for (const [k, v] of Object.entries(env)) {
            expect(Object.keys(process.env).includes(k)).to.be.true;
            expect(v).to.be.equal(process.env[k]);
        }
    });
});
