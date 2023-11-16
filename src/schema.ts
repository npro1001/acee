
type valid_date = `${number}${number}${number}${number}` // type for a four digit number

// the following is a schema definition for querying our books database
export interface Library {

  shelf: (Book | UnknownText)[];

}

//use this type for books
export interface Book {
  type: "search_query",
  //a description of anything should go here
  description?: string
  //if the user specifies sql, SQL, vector, or Vector, put it in this field
  search_method?: "SQL" | "vector"
  date?: valid_date; // a four digit number should be put in this field. if there is no four digit number, use the UnknownText interface
  //if the user specifies that they want to filter by title or content, put it in this field
  filter_by?: "title" | "content"
}

// Use this type for items that match nothing else
export interface UnknownText {
  type: "unknown",
  text: string; // The text that wasn't understood
}


