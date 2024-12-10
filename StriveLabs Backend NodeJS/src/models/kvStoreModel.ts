import { Sequelize, Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class KVStore extends Model {
  public id!: number;
  public tenantId!: string;
  public key!: string;
  public value!: any;
  public ttl?: number; // Time-to-live
  public expiry?: number; // Expiry timestamp
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KVStore.init(
  {
    tenantId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: 'unique_key_per_tenant', // Ensuring the key is unique per tenant
    },
    value: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        maxSize(value: any) {
          const size = Buffer.byteLength(JSON.stringify(value), 'utf8');
          if (size > 16384) {
            throw new Error('Value exceeds the maximum size of 16KB');
          }
        },
      },
    },
    ttl: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    expiry: {
      type: DataTypes.BIGINT, // Used BIGINT to handle large timestamp values
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'kv_store',
    indexes: [
      {
        unique: true,
        fields: ['tenantId', 'key'], // Ensuring the key is unique per tenant
      },
      {
        fields: ['tenantId'], // Indexing tenantId for better performance
      },
    ],
  }
);

export default KVStore;
