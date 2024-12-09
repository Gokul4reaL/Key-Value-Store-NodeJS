import { Sequelize } from "sequelize";
import KVStore from "../src/models/kvStoreModel"; // Assuming this is your Sequelize model
import sequelize from "../src/config/database"; // Assuming this is your database connection

describe("KVStore", () => {
  let kvStore: any;

  beforeAll(async () => {
    // Sync the database before tests run
    await sequelize.sync({ force: true }); // This will recreate the tables before running tests
  });

  afterAll(async () => {
    // Clean up by closing the database connection after all tests
    await sequelize.close();
  });

  beforeEach(async () => {
    // Setup logic before each test (if necessary)
    kvStore = KVStore; // Using the actual Sequelize model for interaction
  });

  afterEach(async () => {
    // Cleanup the database after each test
    await KVStore.destroy({ where: {}, truncate: true }); // Truncate the table to reset data between tests
  });

  test("should create and read a key-value pair", async () => {
    // Create a key-value pair
    await kvStore.create({ key: "testKey", value: { foo: "bar" }, ttl: 5 });

    // Read the key-value pair
    const data = await kvStore.findOne({ where: { key: "testKey" } });
    expect(data?.value).toEqual({ foo: "bar" });
  });

  test("should delete a key", async () => {
    // Create a key-value pair
    await kvStore.create({ key: "testKey", value: { foo: "bar" } });

    // Delete the key-value pair
    await kvStore.destroy({ where: { key: "testKey" } });

    // Try to read the key (should return null or throw error)
    const data = await kvStore.findOne({ where: { key: "testKey" } });
    expect(data).toBeNull();
  });

  test("should handle TTL expiry", async () => {
    // Create a key-value pair with TTL (1 second)
    await kvStore.create({ key: "testKey", value: { foo: "bar" }, ttl: 1 });

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 1100)); // Wait for 1.1 seconds

    // Try to read the key (should return null or throw error)
    const data = await kvStore.findOne({ where: { key: "testKey" } });
    expect(data).toBeNull(); // Key should be expired and removed
  });

  test("should batch create keys", async () => {
    // Create multiple keys in batch
    await kvStore.bulkCreate([
      { key: "key1", value: { a: 1 } },
      { key: "key2", value: { b: 2 } },
    ]);

    // Read the keys and check their values
    const data1 = await kvStore.findOne({ where: { key: "key1" } });
    const data2 = await kvStore.findOne({ where: { key: "key2" } });

    expect(data1?.value).toEqual({ a: 1 });
    expect(data2?.value).toEqual({ b: 2 });
  });
});
