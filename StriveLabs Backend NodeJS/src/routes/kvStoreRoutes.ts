import { Request, Response, Router } from 'express';
import KVStore from '../models/kvStoreModel';
import { ExpiredKeyError, NotFoundError, ValidationError } from '../utils/errors';

const router = Router();

// Validation function for key size
const validateKeySize = (key: string) => {
  if (key.length > 32) {
    throw new ValidationError('Key length cannot exceed 32 characters');
  }
};

// Create operation
router.post('/api/kv', async (req: any, res: any) => {
  const { key, value, ttl } = req.body;

  try {
    validateKeySize(key);
    
    const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
    const existingKey = await KVStore.findOne({ where: { key } });

    if (existingKey) {
      return res.status(400).json({ error: 'Key already exists' });
    }

    await KVStore.create({ key, value, ttl, expiry });
    res.status(201).json({ message: 'Key-Value pair created successfully' });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read operation
router.get('/api/kv/:key', async (req: any, res: any) => {
  const { key } = req.params;

  try {
    const data = await KVStore.findOne({ where: { key } });

    if (!data) {
      throw new NotFoundError('Key not found');
    }

    if (data.expiry && data.expiry <= Date.now()) {
      await KVStore.destroy({ where: { key } });
      throw new ExpiredKeyError('Key has expired');
    }

    res.status(200).json({ key, value: data.value });
  } catch (error: any) {
    if (error instanceof ExpiredKeyError || error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete operation
router.delete('/api/kv/:key', async (req: any, res: any) => {
  const { key } = req.params;

  try {
    const data = await KVStore.findOne({ where: { key } });
    if (!data) {
      throw new NotFoundError('Key not found');
    }

    await KVStore.destroy({ where: { key } });
    res.status(200).json({ message: 'Key deleted successfully' });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Batch create operation with limit and validation
router.post('/api/kv/batch', async (req: any, res: any) => {
  const { entries } = req.body;
  const failedEntries: string[] = [];

  try {
    // Batch limit check
    if (entries.length > 100) {
      return res.status(400).json({ error: 'Batch limit is 100 entries' });
    }

    for (const { key, value, ttl } of entries) {
      try {
        validateKeySize(key);

        const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
        const existingKey = await KVStore.findOne({ where: { key } });

        if (existingKey) {
          failedEntries.push(key);
        } else {
          await KVStore.create({ key, value, ttl, expiry });
        }
      } catch (error: any) {
        failedEntries.push(key);
      }
    }

    if (failedEntries.length > 0) {
      return res.status(400).json({ error: `Failed to create keys: ${failedEntries.join(', ')}` });
    }

    res.status(201).json({ message: 'Batch create successful' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
