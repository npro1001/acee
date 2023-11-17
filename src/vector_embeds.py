#using python to populate vector database with embeddings from a bunch of wikipedia articles

import singlestoredb as singlestore
import pandas as pd
import os
from ast import literal_eval

HOST = os.getenv('HOST')
USER = os.getenv('USER')
PASSWORD = os.getenv('PASSWORD')
DATABASE = os.getenv('VEC_DATABASE')
PORT = os.getenv('PORT')

df = pd.read_csv(
    'vector_database_wikipedia_articles_embedded.csv'
)

# print(df.head())

# Read vectors from strings back into a list
print("starting title vector")
df['title_vector'] = df.title_vector.apply(literal_eval)
print("done with title vector")

print("starting content vector")
df['content_vector'] = df.content_vector.apply(literal_eval)
print("done with content vector")

# Set vector_id to be a string
print("starting vector id")
df['vector_id'] = df['vector_id'].apply(str)
print("done with vector id")

print(df.info(show_counts=True))

# establish connection to singlestoreDB
conn = singlestore.connect(host=HOST, port=PORT, user=USER,
                  password=PASSWORD, database=DATABASE)

# cursor function used to execute queries
query = conn.cursor()

# Prepare the statement
stmt = """
    INSERT INTO wikipedia (
        id,
        url,
        title,
        text,
        title_vector,
        content_vector,
        vector_id
    )
    VALUES (
        %s,
        %s,
        %s,
        %s,
        JSON_ARRAY_PACK_F64(%s),
        JSON_ARRAY_PACK_F64(%s),
        %s
    )
"""

# Convert the DataFrame to a NumPy record array
record_arr = df.to_records(index=False)

# Set the batch size
batch_size = 1000


print("uploading data to singlestore...")
# Iterate over the rows of the record array in batches
for i in range(0, len(record_arr), batch_size):
    batch = record_arr[i:i+batch_size]
    values = [(
        row[0],
        row[1],
        row[2],
        row[3],
        str(row[4]),
        str(row[5]),
        int(row[6])
    ) for row in batch]
    query.executemany(stmt, values)

print("done uploading data to singlestore")
