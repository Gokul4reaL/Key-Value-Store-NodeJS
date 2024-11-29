import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { KVStore } from "./kvStore"; // Assuming KVStore is in the same folder

const app = express();
const port = 3000;

// Initialize KVStore
const kvStore = new KVStore({ filePath: "./kvStore.json" });

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Create a new key-value pair
// Create a new key-value pair
app.post("/api/kv", async (req: any, res: any) => {
    const { key, value, ttl } = req.body;
  
    // Validate the input
    if (!key || !value) {
      return res.status(400).json({ error: "Key and value are required" });
    }
    if (typeof key !== 'string' || key.length > 32) {
      return res.status(400).json({ error: "Key must be a string with a maximum length of 32 characters" });
    }
    if (ttl && (typeof ttl !== 'number' || ttl <= 0)) {
      return res.status(400).json({ error: "TTL must be a positive number" });
    }
  
    try {
      // Create the key-value pair
      await kvStore.create(key, value, ttl);
      res.status(201).json({ message: "Key-value pair created successfully" });
    } catch (error: any) {
      // If error is a custom Error object, return the message
      if (error instanceof Error) {
        console.error("Error creating key-value pair:", error.message);
        res.status(400).json({ error: error.message });
      } else {
        console.error("An unknown error occurred", error);
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  });

// Read a value by key
app.get("/api/kv/:key", async (req: Request, res: Response) => {
  const { key } = req.params;

  try {
    const value = await kvStore.read(key);
    res.json({ key, value });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Delete a key
app.delete("/api/kv/:key", async (req: Request, res: Response) => {
  const { key } = req.params;

  try {
    await kvStore.delete(key);
    res.json({ message: "Key deleted successfully" });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Handle TTL expiry (just as a general endpoint for testing)
app.get("/api/kv/expiry/:key", async (req: Request, res: Response) => {
  const { key } = req.params;

  try {
    const value = await kvStore.read(key); // This will trigger the TTL check
    res.json({ key, value });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`KVStore API listening at http://localhost:${port}`);
});
