/** @format */

const generateSelectQuery = require("../index.js");

generateSelectQuery({
  tableName: "Orders",
  selectColumns: [{ fieldName: "id" }, { fieldName: "total_cost" }],
  searchField: "t.id",
  queryParams: { searchTerm: "42", sortBy: "DESC", limit: 10 },
}).then(console.log);
