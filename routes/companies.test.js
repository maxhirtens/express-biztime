// Tests for companies.

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
//adds a fake user
beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('ford', 'Ford', 'makes bad cars') RETURNING  code, name, description`
  );
  testCompany = result.rows[0];
});
//deletes test company
afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});
//closes db connection
afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list with companies", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: [
        {
          code: "ford",
          name: "Ford",
          description: "makes bad cars",
        },
      ],
    });
  });
});
