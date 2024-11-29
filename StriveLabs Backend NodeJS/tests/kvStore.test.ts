import { KVStore } from "../src/kvStore";

describe("KVStore", () => {
  let kvStore: KVStore;

  beforeEach(() => {
    kvStore = new KVStore({ filePath: "./testStore.json" });
  });

  afterEach(async () => {
    const fs = require("fs");
    if (fs.existsSync("./testStore.json")) fs.unlinkSync("./testStore.json");
  });

  test("should create and read a key-value pair", async () => {
    await kvStore.create("testKey", { foo: "bar" }, 5);
    const value = await kvStore.read("testKey");
    expect(value).toEqual({ foo: "bar" });
  });

  test("should delete a key", async () => {
    await kvStore.create("testKey", { foo: "bar" });
    await kvStore.delete("testKey");
    await expect(kvStore.read("testKey")).rejects.toThrow("Key not found or expired");
  });

  test("should handle TTL expiry", async () => {
    await kvStore.create("testKey", { foo: "bar" }, 1);
    await new Promise((resolve) => setTimeout(resolve, 1100));  // Wait for TTL expiry
    await expect(kvStore.read("testKey")).rejects.toThrow("Key not found or expired");
  });

  test("should batch create keys", async () => {
    await kvStore.batchCreate([
      { key: "key1", value: { a: 1 } },
      { key: "key2", value: { b: 2 } },
    ]);
    const value1 = await kvStore.read("key1");
    const value2 = await kvStore.read("key2");
    expect(value1).toEqual({ a: 1 });
    expect(value2).toEqual({ b: 2 });
  });
});
