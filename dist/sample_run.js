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
const translator = typechat.createJsonTranslator(model, schema, "Library");
function getBooks(library) {
    // Process the items in the cart
    void library;
}
const openai = new openai_1.default();
// Process requests interactively or from the input file specified on the command line
(0, typechat_1.processRequests)("📚> ", process.argv[2], async (request) => {
    let response = await translator.translate(request);
    if (!response.success) {
        console.log(response);
        return;
    }
    const library = response.data; //get the user response
    let user_response = JSON.parse(JSON.stringify(library, undefined, 2)); //turn it into JSON
    console.log(JSON.stringify(library, undefined, 2));
    //if there are any unknowns, it will display here
    if (library.shelf.some(book => book.type === "unknown")) {
        console.log("I didn't understand the following:");
        for (const book of library.shelf) {
            if (book.type === "unknown") {
                console.log(book.text);
                console.log("unknown");
            }
        }
        return;
    }
    getBooks(library);
    console.log("Success!");
    let year = user_response.shelf[0].date;
    let search_method = user_response.shelf[0].search_method.toLowerCase();
    let filter_by = user_response.shelf[0].filter_by;
    let description = user_response.shelf[0].description;
    console.log(description);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FtcGxlX3J1bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zYW1wbGVfcnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQkFBMkI7QUFDM0IsK0JBQStCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRS9CLG9EQUEyQjtBQUMzQix1Q0FBd0I7QUFDeEIsMkNBQTRCO0FBQzVCLG1EQUFvQztBQUNwQywrQ0FBaUM7QUFFakMsdUNBQTBDO0FBQzFDLG1FQUFpRDtBQUVqRCxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFaEIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4RCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGVBQWUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsb0JBQW9CO0FBQ3ZHLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBVSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBR3BGLFNBQVMsUUFBUSxDQUFDLE9BQWdCO0lBQzlCLGdDQUFnQztJQUNoQyxLQUFLLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxFQUFFLENBQUM7QUFFNUIsc0ZBQXNGO0FBQ3RGLElBQUEsMEJBQWUsRUFBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7SUFDdkQsSUFBSSxRQUFRLEdBQUcsTUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25ELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMs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