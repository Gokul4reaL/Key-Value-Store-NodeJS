import { Sequelize, Op } from 'sequelize';
import KVStore from '../models/kvStoreModel';

const cleanupExpiredKeys = async () => {
  try {
    const now = Date.now();
    // Use Op to compare expiry field with the current time
    await KVStore.destroy({
      where: {
        expiry: {
          [Op.lte]: now, // Compare expiry field with the current timestamp
        },
      },
    });
    console.log('Expired keys cleaned up');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Run cleanup every 30 minutes
setInterval(cleanupExpiredKeys, 30 * 60 * 1000);

export default cleanupExpiredKeys;
