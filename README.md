
# SQL SELECT Query Generator

[![Version](https://img.shields.io/badge/version-1.1.8-yellow.svg)](https://www.npmjs.com/package/sql-select-query-generator)

Generate SQL Server SELECT queries with joins, filters, pagination, a total count, and `FOR JSON PATH` output.

## Installation

```bash
npm install sql-select-query-generator
```

Node.js 18 or newer is required.

## Usage

```javascript
const queryGenerator = require("sql-select-query-generator");

const sampleQuery = {
  tableName: "Orders",
  searchField: "customer.name",
  selectColumns: [{ fieldName: "*", alias: "" }],
  customOrSearch: ["customer.address", "customer.phone"],
  customAndSearch: ["t.total_cost"],
  joins: [
    {
      tableName: "Customers",
      joinName: "customer",
      type: "LEFT",
      isCustomJoin: false,
      selectColumns: [
        { fieldName: "name", alias: "customer_name" },
        { fieldName: "address", alias: "" },
        { fieldName: "phone", alias: "phone" },
      ],
    },
  ],
  queryParams: {
    limit: 20,
    offset: 5,
    sortBy: "DESC",
    orderBy: "t.id",
    searchTerm: "abc",
  },
};

const sql = await queryGenerator(sampleQuery);
console.log(sql);
```

For a runnable version, use `npm run example` or see [examples/basic.js](examples/basic.js).

## Options

| Field | Description |
| --- | --- |
| `tableName` | Required target table. It is aliased as `t`. |
| `selectColumns` | Required columns from the target table. Supports `alias` and `field_type: "json"`. |
| `searchField` | Primary field searched by `queryParams.searchTerm`. Search text is matched literally within `%...%`. |
| `customOrSearch` | Additional fields included in the text-search `OR` group. It can be used without `searchField`. |
| `customAndSearch` | Fields that must also match the search term. It can be used without `searchField`. |
| `customSearch` | Exact `{ field, value }` filters. String values are SQL-escaped. |
| `nullCheckColumns` | Fields required to be non-null. The old misspelling `nullCheckColums` remains supported. |
| `customColumnQuery` | Trusted custom SELECT expression appended to the selected columns. |
| `joins` | Join definitions with `tableName`, `joinName`, optional `type`, selected columns, and optional custom join/filter fields. |
| `queryParams` | `searchTerm`, `orderBy` (default `t.id`), `sortBy` (`ASC` or `DESC`), `offset` (default `0`), and `limit` (default `20`). |

The function returns a Promise containing the SQL string. Table names, column names, join expressions, `orderBy`, and `customColumnQuery` are SQL syntax and must come from trusted application configuration. User-provided values belong in `searchTerm` or exact-search `value` fields, which escape single quotes.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), follow the
[code of conduct](CODE_OF_CONDUCT.md), and run `npm test` before opening a pull
request. See the [changelog](CHANGELOG.md) for release notes.

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

Releases are published automatically from version tags through npm Trusted
Publishing. Maintainer setup and release commands are in
[CONTRIBUTING.md](CONTRIBUTING.md#releases).

## Contributors

See the repository's [contributors](https://github.com/amrishkhan05/sql-query-generator/graphs/contributors).

## Author

[@amrishkhan05](https://github.com/amrishkhan05)

## License

[MIT](LICENSE)
