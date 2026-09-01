/** @format */

const assert = require("node:assert/strict");
const test = require("node:test");
const generateSelectQuery = require("./index.js");

test("generates a default paginated query", async () => {
  const query = await generateSelectQuery({
    tableName: "Orders",
    selectColumns: [{ fieldName: "*" }],
  });

  assert.equal(query, "SELECT (SELECT COUNT(1) FROM Orders t) AS total_count, (SELECT t.* FROM Orders t ORDER BY t.id ASC OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY FOR JSON PATH) AS data");
});

test("combines joins and filters without duplicating search conditions", async () => {
  const query = await generateSelectQuery({
    tableName: "Orders",
    searchField: "customer.name",
    selectColumns: [{ fieldName: "id" }],
    customOrSearch: ["customer.phone"],
    customAndSearch: ["t.total_cost"],
    customSearch: [{ field: "t.status", value: "customer's" }],
    nullCheckColumns: ["customer.id"],
    joins: [
      {
        tableName: "Customers",
        joinName: "customer",
        type: "LEFT",
        selectColumns: [{ fieldName: "name", alias: "customer_name" }],
      },
    ],
    queryParams: { searchTerm: "abc", sortBy: "DESC", offset: 5, limit: 10 },
  });

  assert.match(query, /LEFT JOIN Customers customer ON t\.customer_id = customer\.id/);
  assert.match(query, /\(customer\.name LIKE '%abc%' OR t\.id LIKE '%abc%' OR customer\.phone LIKE '%abc%'\)/);
  assert.match(query, /t\.status = 'customer''s'/);
  assert.match(query, /customer\.id IS NOT NULL/);
  assert.equal(query.match(/customer\.name LIKE/g).length, 2);
});

test("rejects invalid pagination", async () => {
  await assert.rejects(generateSelectQuery({ tableName: "Orders", selectColumns: [{ fieldName: "*" }], queryParams: { limit: 0 } }), /limit must be positive/);
});
