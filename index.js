const CommonSubList = (
  tableName,
  selectColumns,
  searchField = null,
  joins = [],
  customSearch = null,
  paramSearch = null,
  customColumnQuery = null,
  customOrSearch = null,
  customAndSearch = null,
  queryParams = {},
  nullCheckColums = []
) => {
  try {
    let {
      sortBy = "ASC",
      orderBy = "t.id",
      searchTerm,
      offset = 0,
      limit = 20,
    } = queryParams;

    let joinQuery = " ";
    let joinSelect = "";
    let searchQuery = "";
    let joinSearch = "";

    if (searchTerm && searchField)
      searchQuery = `${searchQuery} AND (${searchField} like '%${searchTerm}%' OR t.id like '%${searchTerm}%' )`;
    if (customSearch)
      customSearch.forEach((elem, ind) => {
        joinSearch = `${joinSearch} AND ${elem.field} = '${elem.value}'`;
      });
    if (customOrSearch && customOrSearch.length > 0)
      customOrSearch.forEach(async (el) => {
        if (searchTerm && searchField)
          searchQuery = `${searchQuery} OR (${el} like '%${searchTerm}%' )`;
      });
    if (customAndSearch && customAndSearch.length > 0)
      customAndSearch.forEach(async (el) => {
        if (searchTerm && searchField)
          searchQuery = `${searchQuery} AND (${el} like '%${searchTerm}%' )`;
      });
    if (joins.length > 0) {
      joins.forEach(async (el, index) => {
        if (el.isCustomJoin) {
          joinQuery = `${joinQuery} ${el.type ? el.type : "INNER"} JOIN ${
            el.tableName
          } ${el.joinName} on ${el.customjoin.field}= ${el.customjoin.value} `;
        } else {
          joinQuery = `${joinQuery} ${el.type ? el.type : "INNER"} JOIN ${
            el.tableName
          } ${el.joinName} on t.${el.joinName}_id = ${el.joinName}.id `;
        }
        let qString = "";
        if (el.selectColumns) {
          el.selectColumns.forEach((e, i) => {
            qString = `${qString} ${el.joinName}.${e.fieldName}  ${
              e.alias ? "as " + e.alias : ""
            }${i == el.selectColumns.length - 1 ? "" : ","}`;
          });
        }
        if (el.customSearch)
          el.customSearch.forEach((elem, ind) => {
            joinSearch = `${joinSearch} AND ${elem.field} = ${elem.value}`;
          });

        joinSelect = ` ${joinSelect} ${
          index == joins.length - 1 ? qString : qString + ","
        }`;
      });
    }
    if (nullCheckColums && nullCheckColums.length > 0)
      nullCheckColums.forEach(async (el) => {
        searchQuery = `${searchQuery} AND (${el} is not null )`;
      });

    let targetTableSelect = "";
    selectColumns.forEach(async (e, i) => {
      targetTableSelect = `${targetTableSelect} ${
        e?.field_type === "json" ? "JSON_QUERY(" : ""
      } t.${e.fieldName} ${e?.field_type === "json" ? ")" : ""} ${
        e.alias ? "as " + e.alias : ""
      }  ${i == selectColumns.length - 1 ? "" : ","}`;
    });
    let sqlQuery = ` ( SELECT ${targetTableSelect} ${
      joinSelect ? "," + joinSelect : joinSelect
    } ${
      customColumnQuery ? "," + customColumnQuery : ""
    } from ${tableName} t ${joinQuery}  where  ${searchQuery.substring(4)} ${joinSearch} order by ${orderBy}  ${sortBy} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY FOR JSON PATH ) AS data`;
    const totalQuery = `( SELECT COUNT( 1 ) from ${tableName} t ${joinQuery} where ${searchQuery.substring(4)} ${joinSearch}  ) AS total_count,`;
    const DynamicQuery = `SELECT ${totalQuery}  ${sqlQuery}  `;
    const result = DynamicQuery.trim();
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
};

/** Common Sub List
 * @params {Object} config - Configuration to create query
 * @property {string} config.tableName - Table from where the search record to be fetched first
 * @property {string} config.selectColumns - Columns to be selected from the target tables
 * @property {string} config.searchField - Name of the column on which search can be performed by parsing the search text using query params "search"
 * @property {Object[]} config.customSearch - To add query condition with a slug or similar text
 * @property {string} config.customSearch[].field - The field in any of the joints to be added to the condition with the join name EG; t.name
 * @property {string} config.customSearch[].value - String to be checked against the field name produced in the object
 * @property {string} config.customColumnQuery - Custom query to be concatenated into the generated query
 * @property {string} config.customOrSearch - Array of fields to be validated as OR condition to the fields - (OR)
 * @property {string} config.customAndSearch -  Array of fields to be validated as AND condition to the fields - (AND)
 * @property {Object[]} config.joins[] - To perform the JOIN operation on the query
 * @property {string} config.joins[].tableName - Table name where the join should be performed
 * @property {string} config.joins[].joinName - String value of the join name for the particular join EG; FK in the target table should end with _id AND the join name should be the same without _id
 * @property {Object} config.joins[].type - Type of join EG; LEFT, RIGHT, INNER, OUTER
 * @property {Object} config.joins[].isCustomJoin - To determine whether it is a join with the target table or one of the joins.
 * @property {Object} config.joins[].customjoin - To join a table with one of the joins
 * @property {Object} config.joins[].customjoin.field - The field name to join the table
 * @property {Object} config.joins[].customjoin.value - The field value name to join the table
 */

const generateSelectQuery = async (selectconfig = {}) => {
  try {
    const config = selectconfig;
    const response = await CommonSubList(
      config.tableName,
      config.selectColumns,
      config.searchField,
      config.joins,
      config.customSearch,
      config.paramSearch,
      config.customColumnQuery,
      config.customOrSearch,
      config.customAndSearch,
      config.queryParams,
      config.nullCheckColums
    );
    return response;
  } catch (err) {
    console.error(err);
    return err;
  }
};

module.exports = generateSelectQuery;
