import { expect } from "chai";
import fs from "fs";
import mongoose from "mongoose";
const User = mongoose.connection.models["User"];

describe("integrate user creation test", () => {
    let users = JSON.parse(fs.readFileSync("test/resources/mock_thousand_user_data.json"));
    beforeEach("setup and clean db collection", async ()=> {
        await User.deleteMany({}).exec();
    });
    it("should successfully upload 70% of a thousand fake data", async () => {
        await User.insertMany(users.filter((_,i) => i < 100),{ordered: false, limit: 15}).catch(err => console.log(err));
        expect(await User.countDocuments({}).exec()).to.be.lessThanOrEqual(100).greaterThanOrEqual(85);
    })
})