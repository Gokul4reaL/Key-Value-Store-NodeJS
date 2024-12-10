
# Key-Value Store API

This project implements a multi-tenant key-value store backed by a MySQL database. The service supports basic CRUD operations on key-value pairs, along with batch operations, validation, and expiry handling.

## Prerequisites

Before running the project, ensure you have the following software installed:

- **Node.js** (v14.x or later)
- **MySQL** (v5.7 or later)

You can download and install MySQL from [here](https://dev.mysql.com/downloads/).

## Setup Instructions

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/Gokul4reaL/Strivelabs-Backend-NodeJS.git
cd Strivelabs-Backend-NodeJS
```

### 2. Install Dependencies

Install the required Node.js dependencies using npm:

```bash
npm install
```

This will install the necessary packages listed in `package.json`.

### 3. Configure MySQL

Ensure that MySQL is running on your local machine. You can use a tool like [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) or the MySQL CLI to create the database.

#### Create a Database

1. Log into MySQL:

```bash
mysql -u root -p
```

2. Create the database:

```sql
CREATE DATABASE kv_store_db;
```

3. Update the `config/database.js` file with your MySQL credentials:

```js
module.exports = {
  username: 'root',
  password: 'your_password',
  database: 'kv_store_db',
  host: 'localhost',
  dialect: 'mysql',
};
```

### 4. Run Database Migrations

Run the Sequelize migrations to set up the database schema:

```bash
npx sequelize-cli db:migrate
```

This will create the necessary tables in the `kv_store_db` database.

### 5. Start the Server

You can now start the server using the following command:

```bash
npm start
```

This will start the server on port `3000` by default. You can access the API at `http://localhost:3000`.

### 6. Optional: Development Mode

If you are working in a development environment, you can use the following command to run the server in development mode, which will automatically restart the server on code changes:

```bash
npm run dev
```

The server will still be available at `http://localhost:3000`.

---

## API Endpoints

### 1. **Create a Key-Value Pair** (`POST /api/kv`)

Creates a new key-value pair for a tenant.

**Request Body:**

```json
{
  "key": "exampleKey",
  "value": "exampleValue",
  "ttl": 3600
}
```

- `key`: The key for the value (max 32 characters).
- `value`: The value to be stored (max 16KB).
- `ttl`: The time-to-live for the key in seconds (optional).

**Response:**

- `201 Created`: Key-Value pair created successfully.
- `400 Bad Request`: Validation error (e.g., key exceeds length or tenant limit exceeded).
- `500 Internal Server Error`: Server issues.

---

### 2. **Read a Key-Value Pair** (`GET /api/kv/:key`)

Retrieves the value associated with a key.

**Request Headers:**

- `x-tenant-id`: The tenant ID to retrieve the key for.

**Response:**

- `200 OK`: Returns the key-value pair.
- `404 Not Found`: If the key does not exist or has expired.

**Example Response:**

```json
{
  "key": "exampleKey",
  "value": "exampleValue"
}
```

---

### 3. **Delete a Key-Value Pair** (`DELETE /api/kv/:key`)

Deletes a specific key-value pair.

**Request Headers:**

- `x-tenant-id`: The tenant ID to delete the key for.

**Response:**

- `200 OK`: Key deleted successfully.
- `404 Not Found`: If the key does not exist or has expired.

---

### 4. **Batch Create Key-Value Pairs** (`POST /api/kv/batch`)

Creates multiple key-value pairs for a tenant.

**Request Body:**

```json
{
  "entries": [
    { "key": "key1", "value": "value1", "ttl": 3600 },
    { "key": "key2", "value": "value2", "ttl": 3600 }
  ]
}
```

**Response:**

- `207 Multi-Status`: Some keys successfully created, others failed. Includes `success` and `failed` arrays.
- `400 Bad Request`: Batch limit exceeded (max 100 entries).
- `500 Internal Server Error`: Server issues.

---

## Validation and Error Handling

### 1. **Key Validation**

- Key length cannot exceed 32 characters.
- If the key already exists for the tenant, the request will be rejected with a `400 Bad Request`.

### 2. **Value Validation**

- Value cannot exceed 16KB in size.

### 3. **Tenant Limits**

- Each tenant can store a maximum of 10 key-value pairs.

### 4. **TTL and Expiry**

- `ttl` (time-to-live) is optional. If provided, the `expiry` timestamp is calculated and used to determine the key's expiration.
- Keys that have expired will be deleted automatically when accessed.

---

## Concurrency Handling

To ensure safe handling of concurrent requests, the code uses Sequelize ORM, which handles database-level locking for write operations. This prevents race conditions when multiple users attempt to create the same key concurrently.

---

## Clean-Up of Expired Keys

Expired keys are cleaned up every 30 minutes automatically. This prevents the database from growing indefinitely with expired data.

---

## Error Responses

The API returns appropriate error codes:

- **400 Bad Request**: For invalid inputs or validation errors.
- **404 Not Found**: If the key is not found or has expired.
- **500 Internal Server Error**: For unexpected server errors.

---

## Test Coverage

To test the service, you can use [Postman](https://www.postman.com/) or any other API testing tool to interact with the endpoints. Ensure you set the `x-tenant-id` header for all requests to specify the tenant.

---

## Conclusion

This project provides a simple, multi-tenant key-value store with basic operations and features like data expiry and batch creation. Make sure to follow the setup instructions to get the service running locally and customize it for your needs.

---

### End of README
