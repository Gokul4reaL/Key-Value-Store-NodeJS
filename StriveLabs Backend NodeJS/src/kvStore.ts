import { promises as fs } from "fs";
import path from "path";

export class KVStore {
  private store: Map<string, { value: any; expiry: number | null }> = new Map();
  private filePath: string;

  constructor(options: { filePath?: string } = {}) {
    this.filePath = options.filePath || path.join(__dirname, "kvStore.json");
    this.loadFromFile().catch((err) => {
      console.error("Error loading from file:", err);
    });
  }

  private async loadFromFile() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const parsed: Record<string, { value: any; expiry: number | null }> = JSON.parse(data);
      const now = Date.now();

      // Filter out expired keys while loading the data from the file
      this.store = new Map(
        Object.entries(parsed).filter(([_, { expiry }]) => !expiry || expiry > now)
      );
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;  // If file doesn't exist, it's fine
      if (error instanceof Error) throw error;
      throw new Error("An unknown error occurred");
    }
  }

  private async persistToFile() {
    const storeObject = Object.fromEntries(this.store);
    await fs.writeFile(this.filePath, JSON.stringify(storeObject));
  }

  public async create(key: string, value: any, ttl?: number) {
    if (this.store.has(key)) throw new Error("Key already exists");
    if (key.length > 32) throw new Error("Key exceeds max length of 32 characters");
    if (Buffer.byteLength(JSON.stringify(value)) > 16 * 1024)
      throw new Error("Value exceeds max size of 16KB");

    const expiry = ttl ? Date.now() + ttl * 1000 : null;
    this.store.set(key, { value, expiry });
    await this.persistToFile();
  }

  public async read(key: string): Promise<any> {
    const data = this.store.get(key);
    if (!data) throw new Error("Key not found or expired");

    const now = Date.now();
    if (data.expiry && data.expiry <= now) {
      this.store.delete(key);
      await this.persistToFile();
      throw new Error("Key not found or expired");
    }

    return data.value;
  }

  public async delete(key: string) {
    if (!this.store.delete(key)) throw new Error("Key not found or expired");
    await this.persistToFile();
  }

  public async batchCreate(entries: { key: string; value: any; ttl?: number }[]) {
    if (entries.length > 100)
      throw new Error("Batch exceeds the maximum limit of 100 entries");

    for (const { key, value, ttl } of entries) {
      await this.create(key, value, ttl);
    }
  }
}
