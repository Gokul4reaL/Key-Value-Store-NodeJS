**KVStore API
**
Overview:
---------
This is a simple key-value store API built using Express and TypeScript. The API allows you to perform basic CRUD operations (Create, Read, Delete) on key-value pairs, with an optional Time-to-Live (TTL) for keys. The data is stored in a JSON file.

The project consists of the following routes:
- POST /api/kv - Create a new key-value pair
- GET /api/kv/:key - Read a value by key
- DELETE /api/kv/:key - Delete a key-value pair
- GET /api/kv/expiry/:key - Check if a key has expired based on TTL

Dependencies:
------------
- Express.js: Web framework for Node.js
- TypeScript: JavaScript with static types
- Body-parser: Middleware for parsing JSON bodies
- Node.js: JavaScript runtime
- @types/express: TypeScript type definitions for Express

Getting Started:
----------------
1. Clone the repository:
git clone https://github.com/your-repo-name/kv-store-api.git


2. Navigate to the project folder:
cd kv-store-api


3. Install dependencies:
npm install


4. Ensure that you have Node.js and TypeScript installed on your machine:
node -v tsc -v


5. Start the server:
npx ts-node src/kvStoreApi.ts

7. For testing:
npx jest

8. The API will be running at `http://localhost:3000`.

API Endpoints:
--------------
1. **POST /api/kv**
- **Description**: Create a new key-value pair.
- **Request Body**:
  ```json
  {
    "key": "key45",
    "value": "some value",
    "ttl": 3600
  }
  ```
- **Response**:
  ```json
  {
    "message": "Key-value pair created successfully"
  }
  ```

2. **GET /api/kv/:key**
- **Description**: Read a value by key.
- **URL Parameters**: 
  - `key`: The key for which you want to fetch the value.
- **Response**:
  ```json
  {
    "key": "key45",
    "value": "some value"
  }
  ```

3. **DELETE /api/kv/:key**
- **Description**: Delete a key-value pair.
- **URL Parameters**:
  - `key`: The key you want to delete.
- **Response**:
  ```json
  {
    "message": "Key deleted successfully"
  }
  ```

4. **GET /api/kv/expiry/:key**
- **Description**: Check if a key has expired based on TTL.
- **URL Parameters**:
  - `key`: The key to check for expiry.
- **Response (Key Exists)**:
  ```json
  {
    "key": "key45",
    "value": "some value"
  }
  ```
- **Response (Key Not Found or Expired)**:
  ```json
  {
    "error": "Key not found or expired"
  }
  ```

Contributing:
-------------
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.
