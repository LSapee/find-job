const app = require("../index");
const supertest = require("supertest");
const {stringify} = require("nodemon/lib/utils");
const request = supertest(app);

describe("/jobk endpoint", () => {
    it("should return a response", async () => {
        const response = await request.get("/jobk");
        expect(response.status).toBe(200);
        expect((response)=>response.myList.toBeInstanceOf(Object));
    },2000000);
});