"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterDB = exports.getPool = void 0;
const mysql = require('mysql2');
require('dotenv').config();
const HOST = process.env.HOST;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const SQL_DATABASE = process.env.SQL_DATABASE;
const VEC_DATABASE = process.env.VEC_DATABASE;
async function endConnection(connection) {
    // Close the database connection
    connection.end((err) => {
        if (err) {
            console.error('Error closing the database connection:', err);
        }
        else {
            console.log('Database connection closed');
        }
    });
}
//this function connects to singlestoredb
async function getPool(year, user_search, db_type, embedding, filter_by) {
    let singleStoreConnection;
    //choose database based on user query
    let DATABASE = (db_type == "sql") ? SQL_DATABASE : VEC_DATABASE;
    try {
        singleStoreConnection = mysql.createPool({
            connectionLimit: 10,
            host: HOST,
            user: USER,
            password: PASSWORD,
            database: DATABASE,
        });
        console.log("You have successfully connected to SingleStore.");
        //look in db with no vectors
        if (db_type == "sql") {
            console.log("searching database without vectors...\n");
            filterDB(singleStoreConnection, user_search, year);
        }
        else if (db_type == "vector") {
            console.log("searching database with vectors...\n");
            searchVec(singleStoreConnection, embedding, filter_by);
        }
    }
    catch (err) {
        console.error('ERROR', err);
        process.exit(1);
    }
}
exports.getPool = getPool;
//semantic search using dot product
const searchVec = (connection, embedding, filter_by) => {
    let column = (filter_by == "title" ? "title" : "text");
    let vector = (column == "title" ? "title_vector" : "content_vector");
    //have to use escape quotes, dot_product and json_array_pack suffic (F_64) is dependent on what was used in the insert statement 
    let user_query = "SELECT " + column + ", DOT_PRODUCT_F64(JSON_ARRAY_PACK_F64(\'[" + embedding + "]\'), " + vector + ") AS score FROM wikipedia ORDER BY score DESC LIMIT 5";
    connection.query(user_query, (err, results, fields) => {
        if (err) {
            console.error('Error querying the database:', err);
            connection.end(); // Close the connection in case of an error
        }
        // Process the query results
        printResults("vector", results, filter_by);
    });
};
async function readTable(connection) {
    connection.query('SELECT * FROM dummy_data LIMIT 10', (err, results, fields) => {
        if (err) {
            console.error('Error querying the database:', err);
            connection.end(); // Close the connection in case of an error
        }
        // Process the query results
        printResults("sql", results);
    });
}
//filter the database based on full tell search
function filterDB(connection, request, year) {
    //if year is detected filter by year as well
    let user_query;
    if (year) {
        user_query = 'SELECT * FROM dummy_data WHERE date=' + year + ' AND MATCH (title) AGAINST (\'' + request + '\')';
    }
    else {
        user_query = 'SELECT * FROM dummy_data WHERE MATCH (title) AGAINST (\'' + request + '\')';
    }
    connection.query(user_query, (err, results, fields) => {
        if (err) {
            console.error('Error querying the database:', err);
            connection.end(); // Close the connection in case of an error
        }
        printResults("sql", results);
    });
}
exports.filterDB = filterDB;
//print the results of the database query
function printResults(type, results, filter) {
    if (type == "sql") {
        results.forEach(element => {
            console.log(element.title + " by " + element.author + " published in " + element.date);
        });
    }
    else {
        //format for content
        if (filter == "content") {
            results.forEach(element => {
                console.log(element.text.slice(0, 100) + "...\nSimilarity score: " + Math.round(element.score * 100) + "%\n");
            });
        }
        //format for title
        else {
            results.forEach(element => {
                console.log(element.title + "\nSimilarity score: " + Math.round(element.score * 100) + "%\n");
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luZ2xlc3RvcmVDb25uZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NpbmdsZXN0b3JlQ29ubmVjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDL0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBRTFCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFBO0FBQzdCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFBO0FBQzdCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFBO0FBQ3JDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFBO0FBQzdDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFBO0FBRzdDLEtBQUssVUFBVSxhQUFhLENBQUMsVUFBVTtJQUNuQyxnQ0FBZ0M7SUFFaEMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ25CLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNoRTthQUFNO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQzdDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDO0FBRUQseUNBQXlDO0FBQ2xDLEtBQUssVUFBVSxPQUFPLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVM7SUFDMUUsSUFBSSxxQkFBcUIsQ0FBQztJQUUxQixxQ0FBcUM7SUFDckMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLENB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