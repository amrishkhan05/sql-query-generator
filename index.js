const generateSelectQuery = async (selectconfig = {}) => {
  //   return async () => {
  try {
    const config = selectconfig;
    const response = await CommonSubList(
      config.tableName,
      config.resMessage,
      config.selectColumns,
      config.searchField,
      config.joins,
      config.isChildCheck,
      config.isParentCheck,
      config.customSearch,
      config.paramSearch,
      config.customColumnQuery,
      config.customOrSearch,
      config.customAndSearch,
      config.queryParams
    );
    return response;
  } catch (err) {
    console.error(err);
    return err;
  }
  //   };
};
const CommonSubList = async (
  tableName,
  resMessage,
  selectColumns,
  searchField = null,
  joins = [],
  isChildCheck = { join_name: "t", check: false },
  isParentCheck = { join_name: "t", check: false },
  customSearch = null,
  paramSearch = null,
  customColumnQuery = null,
  customOrSearch = null,
  customAndSearch = null,
  queryParams = {}
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { sort_by, order_by, search, offset, page, LIMIT } = queryParams;
      const sortBy = sort_by ? sort_by : "ASC";
      const orderBy = order_by ? order_by : "id";
      let joinQuery = " ";
      let joinSelect = "";
      let searchQuery = "";
      let joinSearch = "";

      if (search && searchField)
        searchQuery = `${searchQuery} and (${searchField} like '%${search}%' OR t.id like '%${search}%' )`;
      if (customSearch)
        customSearch.forEach((elem, ind) => {
          joinSearch = `${joinSearch} and ${elem.field} = '${elem.value}'`;
        });
      if (customOrSearch && customOrSearch.length > 0)
        customOrSearch.forEach(async (el) => {
          if (search && searchField)
            searchQuery = `${searchQuery} OR (${el} like '%${search}%' )`;
        });
      if (customAndSearch && customAndSearch.length > 0)
        customAndSearch.forEach(async (el) => {
          if (search && searchField)
            searchQuery = `${searchQuery} AND (${el} like '%${search}%' )`;
        });
      if (joins.length > 0) {
        joins.forEach(async (el, index) => {
          if (el.isCustomJoin) {
            joinQuery = `${joinQuery} ${el.type ? el.type : "INNER"} JOIN ${
              el.tableName
            } ${el.join_name} on ${el.customjoin.field}= ${
              el.customjoin.value
            } `;
          } else {
            joinQuery = `${joinQuery} ${el.type ? el.type : "INNER"} JOIN ${
              el.tableName
            } ${el.join_name} on t.${el.join_name}_id = ${el.join_name}.id `;
          }
          let qString = "";
          if (el.selectColumns) {
            el.selectColumns.forEach((e, i) => {
              qString = `${qString} ${el.join_name}.${e.fieldName}  ${
                e.alias ? "as " + e.alias : ""
              }${i == el.selectColumns.length - 1 ? "" : ","}`;
            });
          }
          if (el.customSearch)
            el.customSearch.forEach((elem, ind) => {
              joinSearch = `${joinSearch} and ${elem.field} = ${elem.value}`;
            });

          joinSelect = ` ${joinSelect} ${
            index == joins.length - 1 ? qString : qString + ","
          }`;
        });
      }
      let targetTableSelect = "";
      selectColumns.forEach(async (e, i) => {
        targetTableSelect = `${targetTableSelect} ${
          e?.field_type === "json" ? "JSON_QUERY(" : ""
        } t.${e.fieldName} ${e?.field_type === "json" ? ")" : ""} ${
          e.alias ? "as " + e.alias : ""
        }  ${i == selectColumns.length - 1 ? "" : ","}`;
      });
      let sqlQuery = ` select ${targetTableSelect} ${
        joinSelect ? "," + joinSelect : joinSelect
      } ${
        customColumnQuery ? "," + customColumnQuery : ""
      } from ${tableName} t ${joinQuery}  where t.is_delete=0 and t.is_active=1 ${searchQuery} ${joinSearch}
          order by t.${orderBy}  ${sortBy} OFFSET ${offset} ROWS FETCH NEXT ${LIMIT} ROWS ONLY `;
      let params = [];

      const DynamicQuery = `SELECT (
            SELECT COUNT( 1 ) from ${tableName} t ${joinQuery}  where t.is_delete=0 and t.is_active=1 ${searchQuery} ${joinSearch}  ) AS total_count,
            ( ${sqlQuery} FOR JSON PATH ) AS master_data `;

      console.log("************ SQL QUERY START*************");
      console.log(DynamicQuery, params);
      console.log("************ SQL QUERY END *************");

      return DynamicQuery;
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
};

module.exports = generateSelectQuery;
