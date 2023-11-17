const mysql = require('mysql2')
require('dotenv').config()

const HOST = process.env.HOST
const USER = process.env.USER
const PASSWORD = process.env.PASSWORD
const SQL_DATABASE = process.env.SQL_DATABASE
const VEC_DATABASE = process.env.VEC_DATABASE


async function endConnection(connection) {
    // Close the database connection

    connection.end((err) => {
        if (err) {
            console.error('Error closing the database connection:', err);
        } else {
            console.log('Database connection closed');
        }
    });

}

//this function connects to singlestoredb
export async function getPool(year, user_search, db_type, embedding, filter_by) {
    let singleStoreConnection;

    //choose database based on user query
    let DATABASE = (db_type == "sql") ? SQL_DATABASE : VEC_DATABASE;

    try {
        singleStoreConnection = mysql.createPool({
            connectionLimit: 10,   //how many connections do we want open at a time?                  
            host: HOST,
            user: USER,
            password: PASSWORD,
            database: DATABASE,
        });
        console.log("You have successfully connected to SingleStore.");

        //look in db with no vectors
        if (db_type == "sql") {
            console.log("searching database without vectors...\n")
            filterDB(singleStoreConnection, user_search, year)
        }

        else if (db_type == "vector") {
            console.log("searching database with vectors...\n")
            searchVec(singleStoreConnection, embedding, filter_by)

        }

    }


    catch (err) {
        console.error('ERROR', err);

        process.exit(1);
    }
}


//semantic search using dot product
const searchVec = (connection, embedding, filter_by) => {

    let column = (filter_by == "title" ? "title" : "text")
    let vector = (column == "title" ? "title_vector" : "content_vector")

    //have to use escape quotes, dot_product and json_array_pack suffic (F_64) is dependent on what was used in the insert statement 
    let user_query = "SELECT " + column +
     ", DOT_PRODUCT_F64(JSON_ARRAY_PACK_F64(\'[" + embedding + "]\'), " + vector +
      ") AS score FROM wikipedia ORDER BY score DESC LIMIT 5"

    connection.query(user_query, (err, results, fields) => {
        if (err) {
            console.error('Error querying the database:', err);
            connection.end(); // Close the connection in case of an error

        }

        // Process the query results
        printResults("vector", results, column)

    })

}

async function readTable(connection) {


    connection.query('SELECT * FROM dummy_data LIMIT 10', (err, results, fields) => {
        if (err) {
            console.error('Error querying the database:', err);
            connection.end(); // Close the connection in case of an error

        }

        // Process the query results
        printResults("sql", results)

    })



}


//filter the database based on full tell search
export function filterDB(connection, request, year) {

    //if year is detected filter by year as well
    let user_query
    if (year) {
        user_query = 'SELECT * FROM dummy_data WHERE date=' + year + ' AND MATCH (title) AGAINST (\'' + request + '\')'
    }
    else {
        user_query = 'SELECT * FROM dummy_data WHERE MATCH (title) AGAINST (\'' + request + '\')'
    }


    connection.query(user_query, (err, results, fields) => {
        if (err) {
            console.error('Error querying the database:', err);
            connection.end(); // Close the connection in case of an error

        }

        printResults("sql", results)

    })
}

//print the results of the database query
function printResults(type, results, filter) {

    if (type == "sql") {
        results.forEach(element => {

            console.log(element.title + " by " + element.author + " published in " + element.date)

        });
    }

    else {

        //format for content
        if (filter == "text") {
            results.forEach(element => {

                console.log(element.text.slice(0, 100) + "...\nSimilarity score: " + Math.round(element.score * 100) + "%\n")

            });
        }

        //format for title
        else {

            results.forEach(element => {
             
                console.log(element.title + "\nSimilarity score: " + Math.round(element.score * 100) + "%\n")

            });

        }

    }

}

