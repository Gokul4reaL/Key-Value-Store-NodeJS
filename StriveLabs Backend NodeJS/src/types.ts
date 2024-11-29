export interface KeyValuePair {
    key: string;
    value: Record<string, any>;
    ttl?: number; // in seconds
  }
  
  export interface KVStoreOptions {
    filePath?: string;
  }
  