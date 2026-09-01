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

test("supports JSON expressions, custom columns, joins, and legacy null checks", async () => {
  const query = await generateSelectQuery({
    tableName: "Orders",
    selectColumns: [{ fieldName: "metadata", field_type: "json", alias: "data" }],
    customColumnQuery: "GETUTCDATE() AS generated_at",
    nullCheckColums: ["owner.id"],
    joins: [
      {
        tableName: "Users",
        joinName: "owner",
        isCustomJoin: true,
        customjoin: { field: "t.owner_id", value: "owner.id" },
        customSearch: [{ field: "owner.active", value: true }],
      },
    ],
  });

  assert.match(query, /JSON_QUERY\(t\.metadata\) AS data, GETUTCDATE\(\) AS generated_at/);
  assert.match(query, /INNER JOIN Users owner ON t\.owner_id = owner\.id/);
  assert.match(query, /owner\.active = 'true' AND owner\.id IS NOT NULL/);
});

test("rejects invalid required fields, sorting, and joins", async () => {
  await assert.rejects(generateSelectQuery(), /tableName and at least one select column/);
  await assert.rejects(generateSelectQuery({ tableName: "Orders", selectColumns: [{ fieldName: "id" }], queryParams: { sortBy: "SIDEWAYS" } }), /sortBy must be ASC or DESC/);
  await assert.rejects(generateSelectQuery({ tableName: "Orders", selectColumns: [{ fieldName: "id" }], joins: {} }), /joins must be an array/);
  await assert.rejects(
    generateSelectQuery({ tableName: "Orders", selectColumns: [{ fieldName: "id" }], joins: [{ tableName: "Users", joinName: "owner", isCustomJoin: true }] }),
    /custom joins require customjoin.field and customjoin.value/,
  );
});

test("searches custom fields without requiring a primary search field", async () => {
  const query = await generateSelectQuery({
    tableName: "Orders",
    selectColumns: [{ fieldName: "id" }],
    customOrSearch: ["t.reference"],
    customAndSearch: ["t.description"],
    queryParams: { searchTerm: "invoice" },
  });

  assert.match(query, /WHERE \(t\.reference LIKE '%invoice%'\) AND t\.description LIKE '%invoice%'/);
  assert.doesNotMatch(query, /t\.id LIKE/);
});

test("treats SQL LIKE metacharacters in search terms literally", async () => {
  const query = await generateSelectQuery({
    tableName: "Orders",
    selectColumns: [{ fieldName: "id" }],
    searchField: "t.reference",
    queryParams: { searchTerm: "100%_draft[1]" },
  });

  assert.match(query, /LIKE '%100\[%\]\[_\]draft\[\[\]1\]%'/);
});

test("rejects malformed filter collections", async () => {
  await assert.rejects(generateSelectQuery({ tableName: "Orders", selectColumns: [{ fieldName: "id" }], customSearch: {} }), /customSearch must be an array/);
  await assert.rejects(generateSelectQuery({ tableName: "Orders", selectColumns: [{ fieldName: "id" }], nullCheckColumns: "t.id" }), /nullCheckColumns must be an array/);
});
