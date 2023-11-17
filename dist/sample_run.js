"use strict";
//TODO FILTER SQL QUERIES ✅
//TODO FILTER VECTOR EMBEDDINGS
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const typechat = __importStar(require("typechat"));
const dotenv = __importStar(require("dotenv"));
const typechat_1 = require("typechat");
const singlestoreConnection_1 = require("./singlestoreConnection");
dotenv.config();
const model = typechat.createLanguageModel(process.env);
const schema = fs.readFileSync(path.join(process.cwd(), "src/schema.ts"), "utf8"); //read the schema in
const translator = typechat.createJsonTranslator(model, schema, "Question");
function getBooks(query) {
    // Process the items in the cart
    void query;
}
const openai = new openai_1.default();
// Process requests interactively or from the input file specified on the command line
(0, typechat_1.processRequests)("📚> ", process.argv[2], async (request) => {
    let response = await translator.translate(request);
    if (!response.success) {
        console.log(response);
        return;
    }
    const query = response.data; //get the user response
    let user_response = JSON.parse(JSON.stringify(query, undefined, 2)); //turn it into JSON
    console.log(JSON.stringify(query, undefined, 2));
    //if there are any unknowns, it will display here
    if (query.shelf.some(query => query.type === "unknown")) {
        console.log("I didn't understand the following:");
        for (const item of query.shelf) {
            if (item.type === "unknown") {
                console.log(item.text);
                console.log("unknown");
            }
        }
        return;
    }
    getBooks(query);
    console.log("Success!");
    let year = user_response.shelf[0].date;
    let search_method = (user_response.shelf[0].search_method != null ? user_response.shelf[0].search_method.toLowerCase() : null);
    let filter_by = user_response.shelf[0].filter_by;
    let description = user_response.shelf[0].description;
    //user wants to search in database without vectors
    if (search_method == "sql") {
        (0, singlestoreConnection_1.getPool)(year, description, search_method, null, null);
    }
    //search using vectors!
    else {
        let user_embedding;
        //create the embedding
        openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: [description]
        }).then((response) => {
            user_embedding = response.data[0].embedding;
            (0, singlestoreConnection_1.getPool)(year, null, search_method, user_embedding, filter_by);
        })
            .catch((error) => {
            console.error('RUH OH: ' + error);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FtcGxlX3J1bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zYW1wbGVfcnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQkFBMkI7QUFDM0IsK0JBQStCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRS9CLG9EQUEyQjtBQUMzQix1Q0FBd0I7QUFDeEIsMkNBQTRCO0FBQzVCLG1EQUFvQztBQUNwQywrQ0FBaUM7QUFFakMsdUNBQTBDO0FBQzFDLG1FQUFpRDtBQUVqRCxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFaEIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4RCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGVBQWUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsb0JBQW9CO0FBQ3ZHLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBVyxLQUFLLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR3RGLFNBQVMsUUFBUSxDQUFDLEtBQWU7SUFDN0IsZ0NBQWdDO0lBQ2hDLEtBQUssS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVELE1BQU0sTUFBTSxHQUFHLElBQUksZ0JBQU0sRUFBRSxDQUFDO0FBRTVCLHNGQUFzRjtBQUN0RixJQUFBLDBCQUFlLEVBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO0lBQ3ZELElBQUksUUFBUSxHQUFHLE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFFB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