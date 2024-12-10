import { Router } from 'express';
import KVStore from '../models/kvStoreModel';
import { ExpiredKeyError, NotFoundError, ValidationError } from '../utils/errors';

const router = Router();

const TENANT_LIMIT = 10;

// Middleware to extract tenantId from headers
router.use((req: any, res: any, next) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }
  req.tenantId = tenantId as string;
  next();
});

// Validation function
const validateKeySize = (key: string) => {
  if (key.length > 32) {
    throw new ValidationError('Key length cannot exceed 32 characters');
  }
};

// Create operation
router.post('/api/kv', async (req: any, res: any) => {
  const { key, value, ttl } = req.body;
  const { tenantId } = req;

  try {
    validateKeySize(key);
    const expiry = ttl ? Date.now() + ttl * 1000 : undefined;

    // Check if tenant has exceeded the limit
    const tenantDataCount = await KVStore.count({ where: { tenantId } });
    if (tenantDataCount >= TENANT_LIMIT) {
      return res.status(400).json({ error: 'Tenant data limit exceeded' });
    }

    const existingKey = await KVStore.findOne({ where: { tenantId, key } });
    if (existingKey) {
      return res.status(400).json({ error: 'Key already exists' });
    }

    await KVStore.create({ tenantId, key, value, ttl, expiry });
    res.status(201).json({ message: 'Key-Value pair created successfully' });
  } catch (error: any) {
    res.status(error instanceof ValidationError ? 400 : 500).json({ error: error.message });
  }
});

// Read operation
router.get('/api/kv/:key', async (req: any, res: any) => {
  const { key } = req.params;
  const { tenantId } = req;

  try {
    const data = await KVStore.findOne({ where: { tenantId, key } });
    if (!data) throw new NotFoundError('Key not found');

    // Check if the key has expired
    if (data.expiry && data.expiry <= Date.now()) {
      // If expired, delete and return error
      await KVStore.destroy({ where: { tenantId, key } });
      throw new ExpiredKeyError('Key has expired');
    }

    res.status(200).json({ key, value: data.value });
  } catch (error: any) {
    res.status(error instanceof NotFoundError || error instanceof ExpiredKeyError ? 404 : 500).json({ error: error.message });
  }
});

// Delete operation
router.delete('/api/kv/:key', async (req: any, res: any) => {
  const { key } = req.params;
  const { tenantId } = req;

  try {
    const data = await KVStore.findOne({ where: { tenantId, key } });
    if (!data) throw new NotFoundError('Key not found');

    await KVStore.destroy({ where: { tenantId, key } });
    res.status(200).json({ message: 'Key deleted successfully' });
  } catch (error: any) {
    res.status(error instanceof NotFoundError ? 404 : 500).json({ error: error.message });
  }
});

// Batch create operation
router.post('/api/kv/batch', async (req: any, res: any) => {
  const { entries } = req.body;
  const { tenantId } = req;
  const failedEntries: string[] = [];
  const successfulEntries: string[] = [];

  try {
    // Check if batch exceeds the maximum allowed entries
    if (entries.length > 100) {
      return res.status(400).json({ error: 'Batch limit is 100 entries' });
    }

    // Check if tenant has exceeded the limit for batch operation
    const tenantDataCount = await KVStore.count({ where: { tenantId } });
    if (tenantDataCount >= TENANT_LIMIT) {
      return res.status(400).json({ error: 'Tenant data limit exceeded' });
    }

    for (const { key, value, ttl } of entries) {
      // Stop further creation if the tenant exceeds the limit
      const currentCount = await KVStore.count({ where: { tenantId } });
      if (currentCount >= TENANT_LIMIT) {
        failedEntries.push(key); // Track the failed key
        continue; // Skip to the next key in the batch
      }

      try {
        // Validate key size
        validateKeySize(key);

        // Calculate expiry if TTL is provided
        const expiry = ttl ? Date.now() + ttl * 1000 : undefined;

        // Check if the key already exists
        const existingKey = await KVStore.findOne({ where: { tenantId, key } });
        if (existingKey) {
          failedEntries.push(key); // Track the failed key (already exists)
        } else {
          // Create the key-value pair
          await KVStore.create({ tenantId, key, value, ttl, expiry });
          successfulEntries.push(key); // Track the successfully created key
        }
      } catch (error) {
        failedEntries.push(key); // Track failed keys
      }
    }

    // Return the response with successful and failed entries
    res.status(207).json({ success: successfulEntries, failed: failedEntries });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
