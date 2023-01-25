
# SQL SELECT QUERY GENERATOR

This package can be used to generate select statements for your tables with a JSON input.


**Table of Contents**

- Table creation with relation
- Constructing the JSON to generate the select query.


## Sample Table Creation 

##### Create the table Customers
####

    CREATE TABLE Customers (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    address VARCHAR(255),
    is_active [bit] NULL,
    phone VARCHAR(20));
##### Create the table Orders 
####

    CREATE TABLE Orders (
    id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_cost DECIMAL(10, 2),
    is_active [bit] NULL,
    FOREIGN KEY (customer_id) REFERENCES Customers(id))

##### Create the table Order_Details 
####

    CREATE TABLE Order_Details (
    id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES Orders(id),
    is_active [bit] NULL,
    FOREIGN KEY (product_id) REFERENCES Products(id));
    
##### Create the table Products
#### 

    CREATE TABLE Products (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255),
    is_active [bit] NULL,
    price DECIMAL(10, 2));

### JSON structure
#### The following is the structure of the input JSON object.
    const QueryConfig = {
    tableName: "", // this is the target table and is always considered as t
    searchField: "",
    customSearch: [{ field: "", value: "" }],
    selectColumns: [
        { fieldName: "", alias: "" },
    ],
    customOrSearch: ["joinName.fieldName" , "joinName.fieldName"], 
    customAndSearch: ["joinName.fieldName" , "joinName.fieldName"],
    nullCheckColumns: ["joinName.fieldName" , "joinName.fieldName"],
    customColumnQuery:"",
    joins: [
            {
            tableName: "",
            joinName: "",
            type: "",
            isCustomJoin: false,
            selectColumns: [
                { fieldName: "", alias: "" },
            ],
            },
    ],  
    queryParams: {
        limit: 0,
        offset: 0,
        sortBy: "",
        orderBy: "",
        searchTerm: "",
    },
    };

#### Desciption of the JSON structure
    The above JSON defines an object called "QueryConfig" which appears to be used for
    querying a database. It includes various properties for specifying the details of the
    query such as the table name, fields to be searched, conditions for searching, columns
    to be selected, join details and query parameters.


-   `tableName`: This is a string variable which specifies the name of the table to be queried.
-   `searchField`: This is a string variable which specifies the field that should be searched in the table.
-   `customOrSearch`, `customAndSearch`, `nullCheckColumns`: These are arrays of strings specifying the fields that should be searched, and conditions for searching.
-   `customColumnQuery`: This is a string variable which contains custom query for selected columns.
-   `customSearch`: This is an array of objects, where each object contains two properties:  
	-   `field`: A string specifying the field name that should be searched.
	-   `value`: A string specifying the value to be searched in the specified field.
    
-   `selectColumns`: This is an array of objects, where each object contains two properties:
	-   `fieldName`: A string specifying the field name that should be selected.
	-   `alias`: A string specifying the alias for the selected field.
        
-   `joins`: This is an array of objects, where each object contains several properties:
	-   `tableName`: A string specifying the name of the table to be joined.
	-   `joinName`: A string specifying the name of the join.
	-   `type`: A string specifying the type of join.
	-   `isCustomJoin`: A Boolean value indicating whether the join is custom or not.
	-   `selectColumns`: An array of objects, where each object contains two properties:
		-   `fieldName`: A string specifying the field name of the joined table that should be 	selected.
		-   `alias`: A string specifying the alias for the selected field.

-   `queryParams`: This is an object which contains several properties:
    
	-   `limit`: An integer specifying the maximum number of rows to be returned in the query.
	-   `offset`: An integer specifying the number of rows to skip before starting to return rows.
	-   `orderBy`: A string specifying the field name to sort the results by.
	-   `sortBy`: A string specifying the order of sorting (e.g. "ASC" for ascending, "DESC" for descending).
	-   `searchTerm`: A string specifying the term to search in the query.        
     

##### Sample JSON to select data from the above table using the above JSON structure:

    const sampleQuery =   {
    tableName: "Orders", // this is the target table and is always considered as t  
    searchField: "customer.name",
    customSearch: [{ field: "", value: "" }],
    selectColumns: [{ fieldName: "*", alias: "" }],
    customOrSearch: ["customer.address", "customer.phone"],
    customAndSearch: ["t.total_cost"],
    customColumnQuery: "",
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
        searchTerm: "'abc",
    },
    }


### Using the package

    const queryGenerator = require("sql-select-query-generator");
    queryGenerator(sampleQuery).then((res) =>
    console.log(res));


### Output
    SELECT ( SELECT COUNT( 1 ) from Orders t   LEFT JOIN Customers customer on
    t.customer_id = customer.id  where  (customer.name like '%'abc%' OR 
    t.id like '%'abc%' ) OR (customer.address like '%'abc%' ) OR
    (customer.phone like '%'abc%' ) AND (t.total_cost like '%'abc%' )  AND  = ''  ) AS total_count, 
    ( SELECT   t.*     ,   customer.name  as customer_name, customer.address  , customer.phone  as phone  from Orders t
    LEFT JOIN Customers customer on 
    t.customer_id = customer.id   where   (customer.name like '%'abc%' OR t.id like '%'abc%' ) 
    OR (customer.address like '%'abc%' ) OR
    (customer.phone like '%'abc%' ) AND (t.total_cost like '%'abc%' )
    order by t.id  DESC OFFSET 5 ROWS FETCH NEXT 20 ROWS ONLY FOR JSON PATH ) AS data



## Authors

- [@amrishkhan05](https://www.github.com/amrishkhan05)


## Badges


[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)



## Contributing

Contributions are always welcome!

Please adhere to this project's `code of conduct`.


## 🚀 About Me

```ts
export class Info {

  name: string = 'Amrishkhan'
  age: number = 28
  nationality: string[] = ['Indian']
  languages: string[] = [ 'English', 'Tamil','Malayalam']
  occupation: string = 'Full Stack Developer'
}

export class Programming {

  languages: string[] = ['TypeScript', 'JavaScript']
  stylesheets: string[] = ['CSS', 'SCSS']
  frameworks: string[] = ['Angular', 'React']
  query language: string[] = ['GraphQL','SQL']
  runtimes: string[] = ['Node']
  databases: string[] = ['MSSQL','Mongo']
  learning: string[] = ['React','GraphQL', 'Angular']

}

export class Social {

  linkedin: string = 'https://www.linkedin.com/in/amrishkhan/'
  github: string = 'amrishkhan05'
  instagram: string = '@aka_batman'

}
```
