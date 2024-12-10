import { Op } from 'sequelize';
import KVStore from '../models/kvStoreModel';

const cleanupExpiredKeys = async () => {
  try {
    const now = Date.now();
    await KVStore.destroy({
      where: {
        expiry: {
          [Op.lte]: now,
        },
      },
    });
    console.log('Expired keys cleaned up');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

setInterval(cleanupExpiredKeys, 30 * 60 * 1000);
export default cleanupExpiredKeys;
