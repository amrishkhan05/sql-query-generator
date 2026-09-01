/** @format */

const literal = (value) => `'${String(value).replaceAll("'", "''")}'`;
const likePattern = (value) => literal(`%${String(value).replaceAll("[", "[[]").replaceAll("%", "[%]").replaceAll("_", "[_]")}%`);
const column = (prefix, item) => {
  const value = `${prefix}.${item.fieldName}`;
  const expression = item.field_type === "json" ? `JSON_QUERY(${value})` : value;
  return `${expression}${item.alias ? ` AS ${item.alias}` : ""}`;
};

const generateSelectQuery = async (config = {}) => {
  const { tableName, selectColumns, searchField, joins = [], customSearch = [], customColumnQuery, customOrSearch = [], customAndSearch = [], queryParams = {} } = config;
  const nullCheckColumns = config.nullCheckColumns ?? config.nullCheckColums ?? [];
  const { sortBy = "ASC", orderBy = "t.id", searchTerm, offset = 0, limit = 20 } = queryParams;

  if (!tableName || !Array.isArray(selectColumns) || selectColumns.length === 0) {
    throw new TypeError("tableName and at least one select column are required");
  }
  for (const [name, value] of Object.entries({ joins, customSearch, customOrSearch, customAndSearch, nullCheckColumns })) {
    if (!Array.isArray(value)) throw new TypeError(`${name} must be an array`);
  }
  if (joins.some((join) => join.isCustomJoin && (!join.customjoin?.field || !join.customjoin?.value))) {
    throw new TypeError("custom joins require customjoin.field and customjoin.value");
  }
  if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1) {
    throw new RangeError("offset must be non-negative and limit must be positive integers");
  }

  const direction = String(sortBy).toUpperCase();
  if (direction !== "ASC" && direction !== "DESC") throw new TypeError("sortBy must be ASC or DESC");

  const joinSql = joins
    .map((join) => {
      const on = join.isCustomJoin ? `${join.customjoin.field} = ${join.customjoin.value}` : `t.${join.joinName}_id = ${join.joinName}.id`;
      return `${join.type || "INNER"} JOIN ${join.tableName} ${join.joinName} ON ${on}`;
    })
    .join(" ");

  const selected = [
    ...selectColumns.map((item) => column("t", item)),
    ...joins.flatMap((join) => (join.selectColumns || []).map((item) => column(join.joinName, item))),
    ...(customColumnQuery ? [customColumnQuery] : []),
  ].join(", ");

  const conditions = [];
  if (searchTerm != null && searchTerm !== "" && (searchField || customOrSearch.length || customAndSearch.length)) {
    const pattern = likePattern(searchTerm);
    const alternatives = [searchField, ...(searchField ? ["t.id"] : []), ...customOrSearch].filter(Boolean).map((field) => `${field} LIKE ${pattern}`);
    if (alternatives.length) conditions.push(`(${alternatives.join(" OR ")})`);
    conditions.push(...customAndSearch.map((field) => `${field} LIKE ${pattern}`));
  }
  conditions.push(...customSearch.filter(({ field, value }) => field && value != null).map(({ field, value }) => `${field} = ${literal(value)}`));
  conditions.push(
    ...joins
      .flatMap((join) => join.customSearch || [])
      .filter(({ field, value }) => field && value != null)
      .map(({ field, value }) => `${field} = ${literal(value)}`),
  );
  conditions.push(...nullCheckColumns.map((field) => `${field} IS NOT NULL`));

  const from = `FROM ${tableName} t${joinSql ? ` ${joinSql}` : ""}`;
  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const count = `(SELECT COUNT(1) ${from}${where}) AS total_count`;
  const data = `(SELECT ${selected} ${from}${where} ORDER BY ${orderBy} ${direction} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY FOR JSON PATH) AS data`;
  return `SELECT ${count}, ${data}`;
};

module.exports = generateSelectQuery;
