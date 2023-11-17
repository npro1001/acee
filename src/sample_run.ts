//TODO FILTER SQL QUERIES ✅
//TODO FILTER VECTOR EMBEDDINGS

import OpenAI from "openai"
import * as fs from "fs"
import * as path from "path"
import * as typechat from "typechat"
import * as dotenv from "dotenv";
import { Question } from "./schema"
import { processRequests } from "typechat"
import { getPool } from "./singlestoreConnection"

dotenv.config();

const model = typechat.createLanguageModel(process.env);
const schema = fs.readFileSync(path.join(process.cwd(), "src/schema.ts"), "utf8"); //read the schema in
const translator = typechat.createJsonTranslator<Question>(model, schema, "Question");


function getBooks(query: Question) {
    // Process the items in the cart
    void query;
}

const openai = new OpenAI();

// Process requests interactively or from the input file specified on the command line
processRequests("📚> ", process.argv[2], async (request) => {
    let response = await translator.translate(request);
    if (!response.success) {
        console.log(response);
        return;
    }

    const query = response.data; //get the user response
    let user_response = JSON.parse(JSON.stringify(query, undefined, 2)) //turn it into JSON


    console.log(JSON.stringify(query, undefined, 2))


    //if there are any unknowns, it will display here
    if (query.shelf.some(query => query.type === "unknown")) {
        console.log("I didn't understand the following:");
        for (const item of query.shelf) {
            if (item.type === "unknown") {
                console.log(item.text);
                console.log("unknown")
            }
        }
        return;
    }
    getBooks(query);
    console.log("Success!");

    let year = user_response.shelf[0].date;
    let search_method = (user_response.shelf[0].search_method != null ? user_response.shelf[0].search_method.toLowerCase() : null)
    let filter_by = user_response.shelf[0].filter_by
    let description = user_response.shelf[0].description

   
    //user wants to search in database without vectors
    if(search_method == "sql")
    {
        getPool(year, description, search_method, null, null)
    }


    //search using vectors!
    else {

        let user_embedding

        //create the embedding
        openai.embeddings.create(
            {
                model: "text-embedding-ada-002",
                input: [description]
            }

        ).then((response) =>
        {
            user_embedding = response.data[0].embedding
            getPool(year, null, search_method, user_embedding, filter_by)
        })
        .catch((error) =>
        {
            console.error('RUH OH: '+error)
        })

    }

});

