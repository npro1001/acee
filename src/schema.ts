
type valid_date = `${number}${number}${number}${number}` // type for a four digit number

// the following is a schema definition for querying our wikipedia/book database
export interface Question {

  shelf: (Query | UnknownText)[];

}

//use this type for user queries 
export interface Query {
  type: "search_query",
  //a description of anything should go here
  description?: string
  //if the user specifies sql, SQL, vector, or Vector, put it in this field
  search_method?: "SQL" | "vector"
 // a four digit number should be put in this field. if the number is not a four digit number, put it in UnknownText
  date?: valid_date;
  //if the user specifies that they want to filter by title or content, put it in this field
  filter_by?: "title" | "content"
}

// Use this type for items that match nothing else
export interface UnknownText {
  type: "unknown",
  text: string; // The text that wasn't understood
}


