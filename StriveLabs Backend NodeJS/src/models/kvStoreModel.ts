import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = new Sequelize('mysql://root:root@localhost:3306/kvStore'); // Update with your DB credentials

class KVStore extends Model {
  public id!: number;
  public key!: string;
  public value!: any;
  public ttl?: number;
  public expiry?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KVStore.init(
  {
    key: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    ttl: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    expiry: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'kv_store',
  }
);

export default KVStore;
