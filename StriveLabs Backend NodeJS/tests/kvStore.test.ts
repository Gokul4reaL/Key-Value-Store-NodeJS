import KVStore from "../src/models/kvStoreModel"; // Assuming this is your Sequelize model
import sequelize from "../src/config/database"; // Assuming this is your database connection

// The Tenant ID is required for each request in multi-tenant context
const tenantId = "tenant-123";

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
    await KVStore.destroy({ where: { tenantId }, truncate: true }); // Truncate the table to reset data between tests, filtered by tenantId
  });

  test("should create and read a key-value pair", async () => {
    // Create a key-value pair
    await kvStore.create({
      tenantId,
      key: "testKey",
      value: { foo: "bar" },
      ttl: 5, // Set TTL to 5 seconds for expiry test
    });

    // Read the key-value pair
    const data = await kvStore.findOne({ where: { tenantId, key: "testKey" } });
    expect(data?.value).toEqual({ foo: "bar" });
  });

  test("should delete a key", async () => {
    // Create a key-value pair
    await kvStore.create({ tenantId, key: "testKey", value: { foo: "bar" } });

    // Delete the key-value pair
    await kvStore.destroy({ where: { tenantId, key: "testKey" } });

    // Try to read the key (should return null or throw error)
    const data = await kvStore.findOne({ where: { tenantId, key: "testKey" } });
    expect(data).toBeNull();
  });

  test("should batch create keys", async () => {
    // Create multiple keys in batch
    await kvStore.bulkCreate([
      { tenantId, key: "key1", value: { a: 1 } },
      { tenantId, key: "key2", value: { b: 2 } },
    ]);

    // Read the keys and check their values
    const data1 = await kvStore.findOne({ where: { tenantId, key: "key1" } });
    const data2 = await kvStore.findOne({ where: { tenantId, key: "key2" } });

    expect(data1?.value).toEqual({ a: 1 });
    expect(data2?.value).toEqual({ b: 2 });
  });

});
