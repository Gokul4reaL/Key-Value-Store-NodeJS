## KVStore API

# Overview:
This is a simple key-value store API built using Express and TypeScript. The API allows you to perform basic CRUD operations (Create, Read, Delete) on key-value pairs, with an optional Time-to-Live (TTL) for keys. The data is stored in a database and includes logic to handle TTL expiry.

The project consists of the following routes:

POST /api/kv - Create a new key-value pair
GET /api/kv/:key - Read a value by key
DELETE /api/kv/:key - Delete a key-value pair
GET /api/kv/expiry/:key - Check if a key has expired based on TTL
Dependencies:
Express.js: Web framework for Node.js
TypeScript: JavaScript with static types
Body-parser: Middleware for parsing JSON bodies
Node.js: JavaScript runtime
@types/express: TypeScript type definitions for Express

# Getting Started:

Clone the repository:
git clone https://github.com/Gokul4reaL/Strivelabs-Backend-NodeJS.git

Navigate to the project folder:
cd StriveLabs Backend NodeJS

Install dependencies:
npm install

Ensure that you have Node.js and TypeScript installed on your machine:
node -v
tsc -v

Start the server:
npx ts-node src/server.ts

For testing:
npx jest

The API will be running at http://localhost:3000.

# API Endpoints:

Method: POST
URL: /api/kv
Body: { "key": "newKey", "value": {"username": "user1", "age": 30}, "ttl": 3600 }
Response: {"message": "Key-Value pair created successfully"}
Scenario 2: Read Key that Exists

Method: GET
URL: /api/kv/newKey
Response: {"key": "newKey", "value": {"username": "user1", "age": 30}}
Scenario 3: Read Key that Doesn't Exist

Method: GET
URL: /api/kv/nonExistentKey
Response: {"error": "Key not found"}
Scenario 4: Key Expiry

Method: POST
URL: /api/kv
Body: { "key": "tempKey", "value": {"name": "Temp"}, "ttl": 5 }
Response (after 5 seconds): {"error": "Key has expired"}
Scenario 5: Delete Existing Key

Method: DELETE
URL: /api/kv/newKey
Response: {"message": "Key deleted successfully"}
Scenario 6: Batch Create

Method: POST
URL: /api/kv/batch

Body: {
  "entries": [
    {"key": "batchKey1", "value": {"name": "John"}, "ttl": 3600},
    {"key": "batchKey2", "value": {"name": "Alice"}}
  ]
}

Response: {"message": "Batch create successful"}

# Expiry Handling:
Keys created with a TTL will automatically be checked for expiration when accessed.
If a key has expired, it will be removed from the database, and attempts to retrieve it will return a "Key not found or expired" error.

# Contributing:
Fork the repository.
Create a new branch (git checkout -b feature-branch).
Commit your changes (git commit -am 'Add new feature').
Push to the branch (git push origin feature-branch).
Create a new Pull Request.

# Key Changes:
TTL Expiry Handling: The API now automatically deletes expired keys when accessed, and an error is thrown if the key is expired.
Expiry Check: The /api/kv/expiry/:key endpoint checks whether a key has expired and returns an appropriate response if the key is expired or not found.
