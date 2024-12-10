'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('kv_store', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      tenantId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING(32),
        allowNull: false,
        unique: 'unique_key_per_tenant',
      },
      value: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      ttl: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      expiry: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('kv_store', ['tenantId', 'key']);
    await queryInterface.addIndex('kv_store', ['tenantId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('kv_store');
  },
};
